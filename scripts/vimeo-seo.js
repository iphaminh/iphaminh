require("dotenv").config();
const https = require("https");
const { logVideoToNotion } = require("./notion-log");
const { factsBlock, tagCandidates } = require("./wedding-facts");

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

  // Cited venue/city/state/vendors from Minh's own Facebook and Instagram
  // captions (src/data/weddingFacts.json). null means no source exists, and the
  // prompt then bans place names outright. The old prompt told the model to work
  // "Bay Area" into every description, which is how Arkansas weddings ended up
  // described as California ones here and then titled San Francisco on YouTube.
  const known = factsBlock(title);
  const vendorTags = tagCandidates(title);

  const placeRules = known
    ? `CONFIRMED FACTS — from Minh's own social captions. Use them exactly.
${known}

- The venue and city above are the ONLY place names allowed. Do not add a region,
  metro area, second city or state that is not written above.
- Name the venue in the first two sentences, and credit every vendor by name.`
    : `NO CONFIRMED LOCATION for this wedding. Do NOT name any city, county, state,
region or venue in the title, description or tags. Write about the day itself and
leave placement out. Never write "Bay Area", "Northern California", "Arkansas" or
any other place name. A true general title beats a false specific one.`;

  const vendorTagRule = vendorTags.length
    ? `Start with the confirmed venue and vendor names, which are the tags other
vendors and their clients actually search: ${vendorTags.slice(0, 8).join(", ")}.`
    : `No confirmed venue or vendor names exist for this film, so use none.`;

  const prompt = `You are writing the Vimeo listing for a wedding film by Phaminh Cinematography.
Minh Pham films a small number of weddings a year, documentary at heart, cinematic in craft.
Website https://www.phaminh.com · phaminh@outlook.com · (870) 270-8837

CURRENT VIDEO
Title: ${title}
Description: ${description || "(none)"}
Existing tags: ${tags || "(none)"}

${placeRules}

HOW TO WRITE
Write like Minh describing the day to a person, not like a brochure. Warm, specific,
first person, plain sentences. These phrases are banned because previous auto-generated
descriptions wore them out: "nothing short of", "two souls", "written in the stars",
"breathtaking", "a testament to love", "magical", "unforgettable". Every sentence should
be one only this wedding could claim.

Return ONLY this format, nothing else:

SEO_TITLE: [55-65 chars. Lead with the confirmed venue when there is one, then the
couple's first names, then the confirmed city and state. MUST contain " | " (pipe with
spaces) — the pipeline uses it as the processed marker. No year unless the source title
already has one, and then keep that same year.]

SEO_DESCRIPTION: [200-300 words, short paragraphs. Open with two or three sentences on
one real thing about this day, naming the couple and the confirmed venue. Then one
sentence on how Minh works. Then a "Vendor team" list, one "Role: Name" per line, only
the confirmed vendors — skip the block entirely if none are confirmed. Close with the
website, email and phone. No hashtag block, no emoji banners, no "comment below".]

VIMEO_TAGS: [20 comma-separated tags, lowercase, each under 30 characters. ${vendorTagRule}
Then the confirmed city and state if confirmed, then style tags (wedding videographer,
wedding film, cinematic wedding), then phaminh cinematography and minh pham. No place
name that is not confirmed above.]`;

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

// Exported so scripts/fix-mislabeled.js can reuse the same generator and
// API client instead of duplicating them.
module.exports = { generateSEO, parseSEO, vimeoRequest, updateVimeoVideo, getAllVideos };
