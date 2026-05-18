require("dotenv").config();
const https = require("https");

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
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
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
      model: "claude-opus-4-6",
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
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.content[0].text);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function getLatestVideos() {
  console.log("Fetching latest Vimeo videos...");
  const data = await vimeoRequest(
    "GET",
    `/users/${VIMEO_USER_ID}/videos?per_page=5&sort=date&direction=desc&fields=uri,name,description,tags`
  );
  return data.data || [];
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
    for (const tag of seo.tags.slice(0, 10)) {
      await vimeoRequest("PUT", `/videos/${videoId}/tags/${encodeURIComponent(tag)}`, {});
    }
  }

  return result;
}

async function main() {
  console.log("=== Phaminh Vimeo SEO Automation ===");

  const videoIdArg = process.argv[2];

  let videos;
  if (videoIdArg) {
    console.log(`Processing specific video: ${videoIdArg}`);
    const video = await vimeoRequest("GET", `/videos/${videoIdArg}?fields=uri,name,description,tags`);
    videos = [video];
  } else {
    videos = await getLatestVideos();
    console.log(`Found ${videos.length} recent videos`);
  }

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
    } catch (err) {
      console.error(`❌ Failed for ${video.name}:`, err.message);
    }
  }

  console.log("\n=== Done ===");
}

main();
