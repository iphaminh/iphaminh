require("dotenv").config();
const https = require("https");
const { logVideoToNotion } = require("./notion-log");

const VIMEO_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const VIMEO_USER_ID = process.env.VIMEO_USER_ID;

function vimeoRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vimeo.com",
      path,
      method,
      headers: {
        Authorization: `bearer ${VIMEO_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
    };
    const req = https.request(options, (res) => {
      res.setEncoding("utf8"); // prevent multi-byte characters splitting across chunks
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Vimeo ${method} ${path}: ${res.statusCode} ${data.slice(0, 200)}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(data); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function claudeRequest(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      res.setEncoding("utf8"); // prevent multi-byte characters splitting across chunks
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.content || !parsed.content[0]) {
            return reject(new Error(`Claude API error: ${data.slice(0, 200)}`));
          }
          resolve(parsed.content[0].text);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Fetch every video for the account with full pagination
async function getAllVideos() {
  const videos = [];
  let nextPage = `/users/${VIMEO_USER_ID}/videos?per_page=100&sort=date&direction=desc&fields=uri,name,description,tags`;

  while (nextPage) {
    console.log(`Fetching page: ${nextPage}`);
    const data = await vimeoRequest("GET", nextPage);
    if (!data.data) {
      console.error("Unexpected Vimeo response:", JSON.stringify(data).slice(0, 200));
      break;
    }
    videos.push(...data.data);
    nextPage = data.paging && data.paging.next ? data.paging.next : null;
  }

  return videos;
}

// Videos whose title already contains " | " are already in SEO format — skip them
function needsSEO(video) {
  return !String(video.name || "").includes(" | ");
}

async function generateSEO(video) {
  const title = video.name || "Wedding Film";
  const description = video.description || "";
  const tags = (video.tags || []).map((t) => t.name).join(", ");

  const prompt = `You are an expert wedding videography SEO specialist for Phaminh Cinematography, a luxury wedding film company owned by Minh Pham.

Service areas: Bay Area California, Napa California, Mountain View California, Bentonville Arkansas, Northwest Arkansas, Hot Springs Arkansas.
Website: https://www.phaminh.com
YouTube: https://www.youtube.com/@Phaminh-Cinematography

Current video info:
Title: ${title}
Description: ${description}
Tags: ${tags}

Generate a complete SEO package. Return ONLY this exact format with no extra text:

SEO_TITLE: [compelling 60-char max title with location and keywords]

SEO_DESCRIPTION: [700+ word description with: emotional opening paragraph, film details, vendor credits if mentioned, location keywords, luxury wedding phrases, Bay Area AND Arkansas SEO phrases, call to action with website URL, hashtags at the end]

VIMEO_TAGS: [20 comma-separated tags: mix of location, style, vendor names if known, wedding keywords]`;

  console.log(`Generating SEO for: ${title}`);
  const response = await claudeRequest(prompt);
  return response;
}

function parseSEO(raw) {
  const titleMatch = raw.match(/SEO_TITLE:\s*(.+)/);
  const descMatch = raw.match(/SEO_DESCRIPTION:\s*([\s\S]+?)(?=VIMEO_TAGS:|$)/);
  const tagsMatch = raw.match(/VIMEO_TAGS:\s*(.+)/);

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
    tags: tagsMatch ? tagsMatch[1].trim().split(",").map((t) => t.trim()) : [],
  };
}

async function updateVimeoVideo(videoUri, seo) {
  const videoId = videoUri.replace("/videos/", "");
  console.log(`Updating Vimeo video ${videoId}...`);

  const body = {};
  if (seo.title) body.name = seo.title;
  if (seo.description) body.description = seo.description;

  const result = await vimeoRequest("PATCH", `/videos/${videoId}`, body);

  if (seo.tags && seo.tags.length > 0) {
    for (const tag of seo.tags.slice(0, 20)) {
      await vimeoRequest("PUT", `/videos/${videoId}/tags/${encodeURIComponent(tag)}`, {});
    }
  }

  return result;
}

async function main() {
  console.log("=== Phaminh Vimeo SEO Automation ===");

  if (!VIMEO_TOKEN || !ANTHROPIC_KEY || !VIMEO_USER_ID) {
    console.error("Missing required env vars: VIMEO_ACCESS_TOKEN, ANTHROPIC_API_KEY, VIMEO_USER_ID");
    process.exit(1);
  }

  const videoIdArg = process.argv[2];

  let videos;
  if (videoIdArg) {
    console.log(`Processing specific video: ${videoIdArg}`);
    const video = await vimeoRequest("GET", `/videos/${videoIdArg}?fields=uri,name,description,tags`);
    videos = [video];
  } else {
    videos = await getAllVideos();
    const total = videos.length;
    videos = videos.filter(needsSEO);
    console.log(`Found ${total} total videos — ${videos.length} need SEO (${total - videos.length} already done)`);
  }

  let successCount = 0;
  let failCount = 0;

  for (const video of videos) {
    try {
      const rawSEO = await generateSEO(video);
      const seo = parseSEO(rawSEO);

      console.log("\n--- SEO Generated ---");
      console.log("Title:", seo.title);
      console.log("Description preview:", seo.description?.substring(0, 150) + "...");
      console.log("Tags:", seo.tags.slice(0, 5).join(", ") + "...");

      await updateVimeoVideo(video.uri, seo);
      console.log(`✅ Updated: ${video.name}`);
      successCount++;

      // Log to Notion
      try {
        const videoId = video.uri.replace("/videos/", "");
        await logVideoToNotion({
          videoTitle: seo.title || video.name,
          vimeoUrl: `https://vimeo.com/${videoId}`,
          status: "Processed",
        });
        console.log(`📋 Logged to Notion`);
      } catch (notionErr) {
        console.warn(`⚠️  Notion log failed: ${notionErr.message}`);
      }
    } catch (err) {
      console.error(`❌ Failed for ${video.name}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n=== Done — ${successCount} updated, ${failCount} failed ===`);
  if (failCount > 0 && successCount === 0) process.exit(1);
}

// Only run when executed directly — requiring this module must not trigger a full SEO run
if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal error:", err.message);
    process.exit(1);
  });
}
