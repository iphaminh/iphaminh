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
const { execFile } = require("child_process");
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
const REGISTRY_PATH = path.join(__dirname, "youtube-registry.json");

// Local JSON registry (vimeoId -> youtubeId). Used as a fallback when Vimeo
// rejects new tags (e.g. video is at Vimeo's 100-tag limit) and as belt-and-
// suspenders duplicate protection.
function loadRegistry() {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) return {};
    const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(raw);
    // Drop the "_comment" key so it doesn't get treated as an entry.
    const clean = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (!k.startsWith("_") && typeof v === "string") clean[k] = v;
    }
    return clean;
  } catch (e) {
    console.warn(`  ⚠ Could not read registry (${e.message}) — proceeding without it`);
    return {};
  }
}

function saveRegistryEntry(vimeoId, youtubeId) {
  let parsed = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    try { parsed = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8")); }
    catch (e) { parsed = {}; }
  }
  parsed[vimeoId] = youtubeId;
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(parsed, null, 2) + "\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic HTTPS helpers
// ─────────────────────────────────────────────────────────────────────────────

function httpsRequestJson({ hostname, path, method = "GET", headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const bodyStr = body != null && typeof body !== "string" ? JSON.stringify(body) : body;
    const finalHeaders = { ...headers };
    if (bodyStr) finalHeaders["Content-Length"] = Buffer.byteLength(bodyStr);
    const req = https.request({ hostname, path, method, headers: finalHeaders }, (res) => {
      res.setEncoding("utf8"); // prevent multi-byte characters splitting across chunks
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

// Download a Vimeo video with yt-dlp. It handles all the auth, embed-restriction,
// and format-selection quirks that break naive HTTP downloaders. Requires yt-dlp
// on PATH (installed via brew locally and via pip in the GitHub Action).
function downloadVimeoWithYtDlp(videoId, destPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-f", "best[height<=1080]/best",   // prefer 1080p or below (small enough to upload fast, still HD)
      "-o", destPath,
      "--no-warnings",
      "--no-progress",
      "--referer", "https://www.phaminh.com/",
      `https://vimeo.com/${videoId}`,
    ];
    execFile("yt-dlp", args, { maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`yt-dlp failed: ${stderr || err.message}`));
      }
      if (!fs.existsSync(destPath)) {
        return reject(new Error(`yt-dlp finished but output file not found: ${destPath}`));
      }
      resolve(destPath);
    });
  });
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

function hasYouTubeSyncTag(video, registry) {
  const videoId = video.uri.replace("/videos/", "");
  if (registry && registry[videoId]) return true;
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
      model: "claude-sonnet-4-6",
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
      res.setEncoding("utf8"); // prevent multi-byte characters splitting across chunks
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(data); }
        catch (e) { return reject(new Error(`Claude non-JSON response (${res.statusCode}): ${data.slice(0, 300)}`)); }

        if (parsed.type === "error" || parsed.error) {
          const err = parsed.error || parsed;
          return reject(new Error(`Claude API error (${res.statusCode}) ${err.type || ""}: ${err.message || JSON.stringify(err).slice(0, 300)}`));
        }
        if (!parsed.content?.[0]?.text) {
          return reject(new Error(`Claude unexpected response (${res.statusCode}): ${JSON.stringify(parsed).slice(0, 300)}`));
        }
        resolve(parsed.content[0].text);
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function generateYouTubeSEO(vimeoTitle, vimeoDescription) {
  const prompt = `You are a YouTube SEO specialist optimizing for YouTube's 2026 discovery algorithm.
Client: Phaminh Cinematography — a luxury wedding videography studio owned by Minh Pham.

BRAND CONTEXT
Service areas: San Francisco Bay Area · Napa Valley · Sonoma · Silicon Valley · Marin · Bentonville AR · Fayetteville AR · Rogers AR · Northwest Arkansas · Little Rock · Hot Springs AR.
Website: https://www.phaminh.com
YouTube: https://www.youtube.com/@Phaminh-Cinematography
Instagram: https://www.instagram.com/phaminh/
Contact: phaminh@outlook.com · (870) 270-8837
Positioning: Cinematic, story-first wedding films. Warm, timeless, calm-on-the-wedding-day approach.

SOURCE VIDEO (from Vimeo)
Title: ${vimeoTitle}
Description: ${vimeoDescription || "(no description)"}

YOUR TASK
Produce a complete YouTube SEO package tuned for 2026's algorithm. Return ONLY the exact format below — no preamble, no closing summary.

===== YT_TITLE =====
Rules for the title (60-70 chars ideal, hard cap 100):
- Front-load the primary keyword in the first 40 characters (YouTube weights early words heavily).
- Use the pattern: "[Couple/Venue] | [Location] Wedding Videographer" or "[Emotional hook] | [Location] Wedding Film 2026".
- Include the year "2026" when it fits — it drives freshness rankings.
- Prefer natural, human phrasing over keyword stuffing (YouTube's 2026 update penalizes clickbait).
- Avoid ALL CAPS and excessive emojis (one max, and only if it fits the brand).

===== YT_DESCRIPTION =====
Rules for the description (target 400-600 words):
- **First 125 characters are critical** — they appear as the search snippet AND above-the-fold on watch pages. Lead with 1 emotional sentence that includes the primary keyword + location.
- **Line 2 (still above the fold on mobile):** the concrete "who + where + what" — couple, venue if named, city.
- Include a horizontal separator like "━━━━━━━━━━" between sections so the description scans well.
- **Sections in this order:**
  1. Emotional hook (2-3 sentences, keyword-rich).
  2. About the wedding — vendors and venue named from the source description if any.
  3. About Phaminh Cinematography (1 paragraph: what we do, service areas, style).
  4. "📩 BOOKING & INQUIRIES" — website + email + phone.
  5. "🎬 WATCH MORE" — 2-3 line breaks with placeholder like "→ Wedding films: https://www.phaminh.com/cine"
  6. "🔗 FOLLOW" — Instagram + YouTube subscribe reminder.
  7. Timestamps section labeled "⏱ TIMESTAMPS" with 3-4 approximate chapters (00:00 Introduction / 00:XX Ceremony / etc.) — use best guess based on video type; don't fabricate if unknown for very short teasers.
  8. Community engagement question ("💬 What's your favorite wedding tradition? Let me know in the comments.") — YouTube's 2026 algorithm heavily weights comment engagement.
  9. Final line: 3-5 relevant hashtags (see hashtag rules below).

===== YT_TAGS =====
Return exactly 20 comma-separated tags optimized for 2026 YouTube:
- 1-3 broad category tags (wedding videographer, wedding film, cinematic wedding)
- 5-7 location-specific long-tail tags ("bay area wedding videographer", "northwest arkansas wedding film", "napa valley wedding")
- 3-5 venue or style tags if hinted by source (e.g., "outdoor wedding", "vineyard wedding", "elopement film")
- 2-3 aspirational/searcher-intent phrases ("best wedding videographer 2026", "how to hire a wedding videographer")
- 2-3 brand tags ("phaminh cinematography", "minh pham videographer")
Keep every tag under 30 characters. All lowercase. No hashtag "#" prefix (tags are separate from hashtags).

===== HASHTAGS (embedded in description, not tags) =====
End the description with exactly 5 hashtags on one line. Prioritize:
- 1 primary location hashtag (#BayAreaWeddingVideographer, #ArkansasWeddingFilm, etc.)
- 1 style hashtag (#CinematicWeddingFilm)
- 1 secondary location hashtag if the wedding spans regions
- 1 brand hashtag (#PhaminhCinematography)
- 1 year/trending hashtag (#WeddingFilm2026 or #Wedding2026)
Note: YouTube shows the first 3 hashtags above the title. Choose those 3 to be the highest-search-volume.

FORMAT — return exactly this, and nothing else:

YT_TITLE: <title>

YT_DESCRIPTION: <description with all sections above, real line breaks — no HTML>

YT_TAGS: <tag1>, <tag2>, ..., <tag20>`;

  const raw = await claude(prompt);

  const titleMatch = raw.match(/YT_TITLE:\s*(.+)/);
  const descMatch = raw.match(/YT_DESCRIPTION:\s*([\s\S]+?)(?=YT_TAGS:|$)/);
  const tagsMatch = raw.match(/YT_TAGS:\s*(.+)/);

  const rawTags = tagsMatch
    ? tagsMatch[1].trim().split(",")
        .map((t) => t
          .trim()
          .replace(/^#/, "")             // strip hashtag prefix if any
          .replace(/["'<>]/g, "")          // YouTube forbids quotes, angle brackets
          .replace(/[:\|]/g, " ")          // colons and pipes break tag parsing
          .replace(/\s+/g, " ")            // collapse whitespace
          .trim()
          .toLowerCase()
        )
        .filter((t) => t.length > 1 && t.length < 100)  // YouTube per-tag limits
    : [];
  // YouTube caps total tags at 500 characters. Tags with spaces count as
  // <length> + 2 (surrounded by quotes when serialized). Drop until we fit.
  const tags = [];
  let totalLen = 0;
  for (const t of rawTags) {
    const cost = t.includes(" ") ? t.length + 2 : t.length;
    if (totalLen + cost + 1 > 450) break;
    tags.push(t);
    totalLen += cost + 1;
  }
  console.log(`  🏷  ${tags.length} sanitized tags (${totalLen} chars): ${tags.join(", ")}`);

  return {
    title: titleMatch ? titleMatch[1].trim().slice(0, 100) : vimeoTitle,
    description: descMatch ? descMatch[1].trim().slice(0, 5000) : (vimeoDescription || ""),
    tags: tags.slice(0, 20),
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
    const detail = JSON.stringify(body).slice(0, 300);
    if (body?.error === "invalid_grant") {
      throw new Error(
        `YouTube refresh token is revoked or expired (invalid_grant).\n` +
        `Fix: run \`node scripts/youtube-auth.js\` locally to mint a new refresh token,\n` +
        `then update the YOUTUBE_REFRESH_TOKEN secret in GitHub repo Settings → Secrets.\n` +
        `Google response: ${detail}`
      );
    }
    throw new Error(`YouTube token refresh failed (HTTP ${status}): ${detail}`);
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
      res.setEncoding("utf8");
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
      res.setEncoding("utf8");
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
      res.setEncoding("utf8");
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

  const thumbUrl = findVimeoThumbnail(video);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "yt-sync-"));
  const mp4Path = path.join(tmpDir, `${videoId}.mp4`);
  const thumbPath = path.join(tmpDir, `${videoId}.jpg`);

  try {
    console.log(`  ⬇ Downloading from Vimeo via yt-dlp...`);
    await downloadVimeoWithYtDlp(videoId, mp4Path);
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

    // Tag the Vimeo video so we skip it next run.
    // If Vimeo rejects (403 = tag limit, etc.), fall back to the JSON registry.
    try {
      const tagResult = await tagVimeoVideo(videoId, `${YT_SYNC_TAG_PREFIX}${youtubeId}`);
      if (tagResult.status >= 400) throw new Error(`HTTP ${tagResult.status}`);
      console.log(`  🏷  Vimeo tagged: ${YT_SYNC_TAG_PREFIX}${youtubeId}`);
    } catch (tagErr) {
      console.warn(`  ⚠ Vimeo tag failed (${tagErr.message}) — recording in local registry instead`);
      saveRegistryEntry(videoId, youtubeId);
      console.log(`  🏷  Registry updated: ${videoId} -> ${youtubeId}`);
    }

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
  const parsedLimit = limitArg ? parseInt(limitArg.split("=")[1], 10) : DEFAULT_LIMIT;
  // Clamp to YouTube's practical daily upload quota (~6/day at 1600 units each)
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 5) : DEFAULT_LIMIT;

  const accessToken = await getYouTubeAccessToken();
  console.log("✓ YouTube access token acquired");

  const registry = loadRegistry();
  const registryCount = Object.keys(registry).length;
  if (registryCount) console.log(`✓ Loaded registry with ${registryCount} pre-existing Vimeo → YouTube mappings`);

  let candidates;
  if (forcedId) {
    // Force sync bypasses the sync-tag check but still respects the registry
    // so we don't accidentally re-upload something already on YouTube.
    if (registry[forcedId]) {
      console.log(`Video ${forcedId} is in the registry as youtube:${registry[forcedId]} — already on YouTube. Aborting.`);
      return;
    }
    const { body } = await vimeo("GET", `/videos/${forcedId}?fields=uri,name,description,tags,pictures,download`);
    if (!body?.uri) {
      console.error(`Vimeo video ${forcedId} not found`);
      process.exit(1);
    }
    candidates = [body];
    console.log(`Forcing sync of video ${forcedId}`);
  } else {
    const allVideos = await fetchAllVimeoVideos();
    candidates = allVideos.filter((v) => isSEOFormatted(v) && !hasYouTubeSyncTag(v, registry)).slice(0, limit);
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
  // Fail the workflow step when nothing succeeded, so breakage is visible
  // instead of silently reporting a green run with zero uploads.
  if (fail > 0 && ok === 0) process.exit(1);
}

// Only run when executed directly — requiring this module must not trigger a sync
if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal error:", err.message || err);
    process.exit(1);
  });
}
