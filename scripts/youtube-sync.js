// scripts/youtube-sync.js
// Sync Vimeo videos to YouTube:
//   1. Fetches Vimeo videos that (a) have SEO-format titles (" | ") and
//      (b) are not yet tagged as youtube-synced.
//   2. Downloads the MP4 from Vimeo (720p to keep the pipeline fast).
//   3. Generates YouTube-tuned SEO with Claude (title, description, tags).
//   4. Uploads to YouTube via resumable upload.
//   5. Sets the thumbnail (uses Vimeo's still).
//   6. Tags the Vimeo video with `youtube:<youtubeId>` so we skip it next time.
//   7. Logs both URLs to Notion.
//
// CLI:
//   node scripts/youtube-sync.js                  → sync latest N candidates
//   node scripts/youtube-sync.js <vimeo_id>       → force-sync a specific Vimeo video
//   node scripts/youtube-sync.js --limit=3        → cap uploads this run (default 3)
//
// Quota note: YouTube caps uploads at 1600 units each, 10 000/day default =
// ~6 uploads/day. We default to 3 per run to leave headroom.

require("dotenv").config();
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const os = require("os");
const { logVideoToNotion } = require("./notion-log");

const VIMEO_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_USER_ID = process.env.VIMEO_USER_ID;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const YT_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

const YT_SYNC_TAG_PREFIX = "youtube:";
const DEFAULT_LIMIT = 3;
const PREFERRED_QUALITY_LABEL = /(720p|1080p)/i;

// ─────────────────────────────────────────────────────────────────────────────
// Generic HTTPS helpers
// ─────────────────────────────────────────────────────────────────────────────

function httpsRequestJson({ hostname, path, method = "GET", headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const bodyStr = body != null && typeof body !== "string" ? JSON.stringify(body) : body;
    const finalHeaders = { ...headers };
    if (bodyStr) finalHeaders["Content-Length"] = Buffer.byteLength(bodyStr);
    const req = https.request({ hostname, path, method, headers: finalHeaders }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function httpsRequestForm({ hostname, path, method = "POST", body }) {
  const bodyStr = new URLSearchParams(body).toString();
  return httpsRequestJson({
    hostname, path, method,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: bodyStr,
  });
}

// Follow a URL (possibly across redirects) and stream the response into a file.
function downloadToFile(url, destPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    client.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (redirectsLeft <= 0) return reject(new Error("Too many redirects"));
        return resolve(downloadToFile(res.headers.location, destPath, redirectsLeft - 1));
      }
      if (res.statusCode >= 400) {
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      const out = fs.createWriteStream(destPath);
      res.pipe(out);
      out.on("finish", () => out.close((err) => (err ? reject(err) : resolve(destPath))));
      out.on("error", reject);
    }).on("error", reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Vimeo
// ─────────────────────────────────────────────────────────────────────────────

function vimeo(method, apiPath, body = null) {
  return httpsRequestJson({
    hostname: "api.vimeo.com",
    path: apiPath,
    method,
    headers: {
      Authorization: `bearer ${VIMEO_TOKEN}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
      "Content-Type": "application/json",
    },
    body,
  });
}

async function fetchAllVimeoVideos() {
  const videos = [];
  let nextPage = `/users/${VIMEO_USER_ID}/videos?per_page=100&sort=date&direction=desc&fields=uri,name,description,tags,pictures,download`;
  while (nextPage) {
    const { body } = await vimeo("GET", nextPage);
    if (!body?.data) break;
    videos.push(...body.data);
    nextPage = body.paging?.next || null;
  }
  return videos;
}

function pickBestDownload(video) {
  const downloads = video.download || [];
  if (!downloads.length) return null;
  // Prefer 720p or 1080p (fast download+upload, still HD).
  const preferred = downloads.find((d) => PREFERRED_QUALITY_LABEL.test(d.public_name || d.rendition || ""))
                 || downloads.find((d) => (d.height || 0) <= 1080)
                 || downloads[0];
  return preferred.link;
}

function findVimeoThumbnail(video) {
  const sizes = video.pictures?.sizes;
  if (!sizes?.length) return null;
  const sorted = [...sizes].sort((a, b) => b.width - a.width);
  return sorted[0].link;
}

async function tagVimeoVideo(videoId, tag) {
  return vimeo("PUT", `/videos/${videoId}/tags/${encodeURIComponent(tag)}`, {});
}

function hasYouTubeSyncTag(video) {
  return (video.tags || []).some((t) => (t.name || "").startsWith(YT_SYNC_TAG_PREFIX));
}

function isSEOFormatted(video) {
  return String(video.name || "").includes(" | ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Claude — YouTube-tuned SEO
// ─────────────────────────────────────────────────────────────────────────────

function claude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const req = https.request({
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data).content[0].text);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function generateYouTubeSEO(vimeoTitle, vimeoDescription) {
  const prompt = `You are a YouTube SEO specialist for Phaminh Cinematography, a luxury wedding film company owned by Minh Pham.

Service areas: San Francisco Bay Area · Napa · Mountain View California · Bentonville Arkansas · Northwest Arkansas · Hot Springs Arkansas.
Website: https://www.phaminh.com
Instagram: @phaminh

The video was originally published on Vimeo with this metadata:
Title: ${vimeoTitle}
Description: ${vimeoDescription || "(no description)"}

Now generate a complete YouTube SEO package tuned for YouTube's search + discovery (YouTube prefers different phrasing than Vimeo: front-load high-intent keywords, questions, and location searches).

Return ONLY this exact format:

YT_TITLE: [max 100 chars. Front-load with the couple names or venue + location + "wedding videographer/cinematographer" phrasing]

YT_DESCRIPTION: [500+ words. Structure:
- 1-2 sentence emotional hook
- Wedding details (couple, venue, location, date if in original)
- What you loved capturing
- Vendor credits mentioning any that appear in the original
- Call to action: "Book your wedding film at https://www.phaminh.com"
- Contact: phaminh@outlook.com
- Follow on Instagram: https://www.instagram.com/phaminh/
- Hashtags at the end (10-15 relevant tags)]

YT_TAGS: [15 comma-separated tags optimized for YouTube search: mix location-specific ("bay area wedding videographer"), venue names if present, style keywords ("cinematic wedding film"), and long-tail phrases ("best wedding videographer in northwest arkansas")]`;

  const raw = await claude(prompt);

  const titleMatch = raw.match(/YT_TITLE:\s*(.+)/);
  const descMatch = raw.match(/YT_DESCRIPTION:\s*([\s\S]+?)(?=YT_TAGS:|$)/);
  const tagsMatch = raw.match(/YT_TAGS:\s*(.+)/);

  return {
    title: titleMatch ? titleMatch[1].trim().slice(0, 100) : vimeoTitle,
    description: descMatch ? descMatch[1].trim() : (vimeoDescription || ""),
    tags: tagsMatch ? tagsMatch[1].trim().split(",").map((t) => t.trim()).filter(Boolean).slice(0, 15) : [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// YouTube — access token, upload, thumbnail
// ─────────────────────────────────────────────────────────────────────────────

async function getYouTubeAccessToken() {
  const { status, body } = await httpsRequestForm({
    hostname: "oauth2.googleapis.com",
    path: "/token",
    body: {
      client_id: YT_CLIENT_ID,
      client_secret: YT_CLIENT_SECRET,
      refresh_token: YT_REFRESH_TOKEN,
      grant_type: "refresh_token",
    },
  });
  if (status !== 200 || !body?.access_token) {
    throw new Error(`YouTube token refresh failed: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body.access_token;
}

// Resumable upload — reliable for videos of any size.
async function youtubeUpload({ accessToken, filePath, seo }) {
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;

  const metadata = {
    snippet: {
      title: seo.title,
      description: seo.description,
      tags: seo.tags,
      categoryId: "26", // Howto & Style — closest for wedding films
    },
    status: {
      privacyStatus: "public",
      selfDeclaredMadeForKids: false,
      embeddable: true,
    },
  };
  const metaBody = JSON.stringify(metadata);

  // Step 1: initiate resumable upload
  const initReq = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "www.googleapis.com",
      path: "/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "Content-Length": Buffer.byteLength(metaBody),
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": fileSize,
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
    req.write(metaBody);
    req.end();
  });

  if (initReq.status !== 200 || !initReq.headers.location) {
    throw new Error(`YouTube init failed: ${initReq.status} ${initReq.body?.slice(0, 200)}`);
  }
  const uploadUrl = initReq.headers.location;

  // Step 2: PUT the video bytes to the upload URL
  const uploadResult = await new Promise((resolve, reject) => {
    const parsed = new URL(uploadUrl);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": fileSize,
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    fs.createReadStream(filePath).pipe(req);
  });

  if (uploadResult.status >= 400 || !uploadResult.body?.id) {
    throw new Error(`YouTube upload failed: ${uploadResult.status} ${JSON.stringify(uploadResult.body).slice(0, 300)}`);
  }
  return uploadResult.body.id;
}

async function setYouTubeThumbnail({ accessToken, videoId, thumbnailPath }) {
  const stats = fs.statSync(thumbnailPath);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "www.googleapis.com",
      path: `/upload/youtube/v3/thumbnails/set?videoId=${videoId}&uploadType=media`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "image/jpeg",
        "Content-Length": stats.size,
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`Thumbnail set failed: ${res.statusCode} ${data.slice(0, 200)}`));
        resolve(data);
      });
    });
    req.on("error", reject);
    fs.createReadStream(thumbnailPath).pipe(req);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function processVideo(video, accessToken) {
  const videoId = video.uri.replace("/videos/", "");
  const label = `${video.name} (${videoId})`;
  console.log(`\n▶ ${label}`);

  const downloadUrl = pickBestDownload(video);
  if (!downloadUrl) {
    console.log(`  ✗ No downloadable rendition available (check Vimeo plan / video privacy).`);
    return;
  }

  const thumbUrl = findVimeoThumbnail(video);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "yt-sync-"));
  const mp4Path = path.join(tmpDir, `${videoId}.mp4`);
  const thumbPath = path.join(tmpDir, `${videoId}.jpg`);

  try {
    console.log(`  ⬇ Downloading from Vimeo...`);
    await downloadToFile(downloadUrl, mp4Path);
    const sizeMB = (fs.statSync(mp4Path).size / (1024 * 1024)).toFixed(1);
    console.log(`  ⬇ Downloaded ${sizeMB} MB`);

    if (thumbUrl) {
      await downloadToFile(thumbUrl, thumbPath);
      console.log(`  ⬇ Thumbnail downloaded`);
    }

    console.log(`  ✨ Generating YouTube SEO with Claude...`);
    const seo = await generateYouTubeSEO(video.name, video.description);
    console.log(`  ✨ Title: ${seo.title}`);
    console.log(`  ✨ Tags: ${seo.tags.slice(0, 5).join(", ")}...`);

    console.log(`  ⬆ Uploading to YouTube...`);
    const youtubeId = await youtubeUpload({ accessToken, filePath: mp4Path, seo });
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    console.log(`  ✅ Uploaded: ${youtubeUrl}`);

    if (thumbUrl && fs.existsSync(thumbPath)) {
      try {
        await setYouTubeThumbnail({ accessToken, videoId: youtubeId, thumbnailPath: thumbPath });
        console.log(`  ✅ Thumbnail set`);
      } catch (e) {
        console.warn(`  ⚠ Thumbnail set failed (non-fatal): ${e.message}`);
      }
    }

    // Tag the Vimeo video so we skip it next run
    await tagVimeoVideo(videoId, `${YT_SYNC_TAG_PREFIX}${youtubeId}`);
    console.log(`  🏷  Vimeo tagged: ${YT_SYNC_TAG_PREFIX}${youtubeId}`);

    // Log to Notion
    try {
      await logVideoToNotion({
        videoTitle: seo.title,
        vimeoUrl: `https://vimeo.com/${videoId}`,
        status: "YouTube-Synced",
      });
      console.log(`  📋 Logged to Notion`);
    } catch (e) {
      console.warn(`  ⚠ Notion log failed (non-fatal): ${e.message}`);
    }
  } finally {
    // Clean up temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  console.log("=== Phaminh Vimeo → YouTube Sync ===");

  if (!VIMEO_TOKEN || !ANTHROPIC_KEY || !YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) {
    console.error("Missing required environment variables (VIMEO_ACCESS_TOKEN, ANTHROPIC_API_KEY, YOUTUBE_CLIENT_ID/SECRET/REFRESH_TOKEN)");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const forcedId = args.find((a) => /^\d+$/.test(a));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : DEFAULT_LIMIT;

  const accessToken = await getYouTubeAccessToken();
  console.log("✓ YouTube access token acquired");

  let candidates;
  if (forcedId) {
    const { body } = await vimeo("GET", `/videos/${forcedId}?fields=uri,name,description,tags,pictures,download`);
    if (!body?.uri) {
      console.error(`Vimeo video ${forcedId} not found`);
      process.exit(1);
    }
    candidates = [body];
    console.log(`Forcing sync of video ${forcedId}`);
  } else {
    const allVideos = await fetchAllVimeoVideos();
    candidates = allVideos.filter((v) => isSEOFormatted(v) && !hasYouTubeSyncTag(v)).slice(0, limit);
    console.log(`Found ${allVideos.length} videos total; ${candidates.length} eligible for YouTube sync (limit: ${limit})`);
  }

  if (!candidates.length) {
    console.log("Nothing to do. Every SEO-optimized Vimeo video is already synced to YouTube.");
    return;
  }

  let ok = 0, fail = 0;
  for (const video of candidates) {
    try {
      await processVideo(video, accessToken);
      ok++;
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n=== Done — ${ok} uploaded, ${fail} failed ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
