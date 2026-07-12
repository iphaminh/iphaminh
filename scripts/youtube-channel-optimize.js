// scripts/youtube-channel-optimize.js
// Optimize YouTube channel-level SEO: rewrite the About-tab description,
// set hidden channel keywords, country, and default language.
//
// Usage:
//   node scripts/youtube-channel-optimize.js               → dry-run (preview only)
//   node scripts/youtube-channel-optimize.js --apply       → push changes to YouTube
//
// Fixes the current channel's wrong "Atlanta GA + Central Arkansas" copy —
// which is holding you back in Bay Area local search — and fills in the
// hidden metadata fields YouTube's 2026 algorithm reads for topic
// classification and location targeting.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const https = require("https");
const querystring = require("querystring");

const YT_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const APPLY = process.argv.includes("--apply");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getYouTubeAccessToken() {
  const body = querystring.stringify({
    client_id: YT_CLIENT_ID,
    client_secret: YT_CLIENT_SECRET,
    refresh_token: YT_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "oauth2.googleapis.com", path: "/token", method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let d = ""; res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve(JSON.parse(d).access_token); }
        catch (e) { reject(new Error("Bad token response")); }
      });
    });
    req.on("error", reject);
    req.write(body); req.end();
  });
}

function ytRequest({ method = "GET", path, accessToken, body }) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "www.googleapis.com", path, method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function claude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const req = https.request({
      hostname: "api.anthropic.com", path: "/v1/messages", method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(d); }
        catch (e) { return reject(new Error(`Claude non-JSON: ${d.slice(0, 200)}`)); }
        if (parsed.type === "error" || parsed.error) {
          return reject(new Error(`Claude API error: ${(parsed.error || parsed).message}`));
        }
        resolve(parsed.content?.[0]?.text || "");
      });
    });
    req.on("error", reject);
    req.write(body); req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate the new channel copy with Claude
// ─────────────────────────────────────────────────────────────────────────────

async function generateChannelSEO() {
  const prompt = `You are optimizing the YouTube CHANNEL-level SEO (About tab + hidden keywords field) for Phaminh Cinematography — a luxury wedding videography studio owned by Minh Pham.

CRITICAL CORRECTION
The current channel description is WRONG. It says "Based in Atlanta, GA, and Central Arkansas" — that is not accurate. The correct service areas are:
- Primary: San Francisco Bay Area + Northern California (Napa Valley, Sonoma, Silicon Valley, Marin County)
- Primary: Northwest Arkansas (Fayetteville, Bentonville, Rogers, Springdale)
- Also: Central Arkansas (Little Rock, Hot Springs), Southern California, and destination weddings worldwide

BRAND FACTS
- Owner: Minh Pham
- Website: https://www.phaminh.com
- Email: phaminh@outlook.com
- Phone: (870) 270-8837
- Instagram: https://www.instagram.com/phaminh/
- Style: Cinematic, story-first wedding films. Warm, timeless, calm-on-the-wedding-day approach. Editorial pacing.
- Serves: Weddings, elopements, engagements, and destination films

TASK
Produce TWO deliverables optimized for YouTube's 2026 algorithm.

===== CHANNEL_DESCRIPTION =====
Rules:
- Max ~1000 characters (YouTube caps at ~5000 but shorter is more engaging).
- First 100 characters are the most important — they appear as the search snippet and above-the-fold in About tab. Front-load "Bay Area & Arkansas Wedding Videographer" or similar high-intent phrase.
- Include the primary service areas with actual city names for local SEO (San Francisco, Napa, Bentonville, Fayetteville, etc.) — YouTube uses these to trigger recommendations to viewers in those regions.
- Use short paragraphs (2-3 sentences each) separated by blank lines. YouTube's About tab renders whitespace as-is.
- Include a "WHAT WE DO" or "SERVICES" style list.
- Include contact + booking info (website, email, phone).
- Include Instagram link.
- End with 6-8 relevant hashtags on one line (YouTube parses these for topic classification).

===== CHANNEL_KEYWORDS =====
The hidden keywords field YouTube's algorithm reads. Format: single line, space-separated tokens. Multi-word phrases should be wrapped in double quotes. Rules:
- 15-20 phrases mixing broad + long-tail + location + brand.
- Prioritize: "bay area wedding videographer", "northwest arkansas wedding videographer", "napa valley wedding film", etc.
- Include specific city names as separate entries too.
- Include: cinematic wedding, luxury wedding film, destination wedding videographer, elopement film, engagement film.
- Include brand: "phaminh cinematography", "minh pham".
- Total under 500 characters.

FORMAT — return exactly this, nothing else:

CHANNEL_DESCRIPTION:
<the description with real line breaks>

CHANNEL_KEYWORDS: <the keywords line>
`;

  const raw = await claude(prompt);

  const descMatch = raw.match(/CHANNEL_DESCRIPTION:\s*([\s\S]+?)(?=CHANNEL_KEYWORDS:)/);
  const kwMatch = raw.match(/CHANNEL_KEYWORDS:\s*(.+)/);

  const description = descMatch ? descMatch[1].trim() : "";
  const keywords = kwMatch ? kwMatch[1].trim().slice(0, 500) : "";

  return { description, keywords };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function diffPreview(label, oldVal, newVal) {
  console.log(`\n${label}`);
  console.log("─".repeat(80));
  console.log("OLD:");
  console.log(String(oldVal || "(not set)").split("\n").map((l) => "  " + l).join("\n"));
  console.log("");
  console.log("NEW:");
  console.log(String(newVal || "").split("\n").map((l) => "  " + l).join("\n"));
  console.log("");
}

async function main() {
  console.log("=== YouTube Channel SEO Optimizer ===\n");

  if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN || !ANTHROPIC_KEY) {
    console.error("Missing YOUTUBE_* or ANTHROPIC_API_KEY in .env");
    process.exit(1);
  }

  const token = await getYouTubeAccessToken();

  // Fetch current channel state
  const chRes = await ytRequest({
    accessToken: token,
    path: "/youtube/v3/channels?part=snippet,brandingSettings&mine=true",
  });
  if (chRes.status >= 400 || !chRes.body.items?.[0]) {
    console.error("Failed to fetch channel:", JSON.stringify(chRes.body).slice(0, 300));
    process.exit(1);
  }
  const channel = chRes.body.items[0];
  const channelId = channel.id;

  const currentDesc = channel.snippet.description || "";
  const currentKeywords = channel.brandingSettings?.channel?.keywords || "";
  const currentCountry = channel.brandingSettings?.channel?.country || channel.snippet.country || "";
  const currentLang = channel.snippet.defaultLanguage || "";

  console.log(`Channel: ${channel.snippet.title}   (${channelId})`);
  console.log(`Custom URL: ${channel.snippet.customUrl || "(none)"}`);
  console.log(`Subs: ${channel.statistics?.subscriberCount || "?"} · Videos: ${channel.statistics?.videoCount || "?"} · Views: ${channel.statistics?.viewCount || "?"}\n`);

  console.log("Generating optimized copy with Claude...\n");
  const { description: newDesc, keywords: newKeywords } = await generateChannelSEO();

  if (!newDesc || !newKeywords) {
    console.error("Claude returned incomplete output. Raw response check needed.");
    process.exit(1);
  }

  const newCountry = "US";
  const newLang = "en";

  // Preview all changes
  diffPreview("▪ CHANNEL DESCRIPTION", currentDesc, newDesc);
  diffPreview("▪ CHANNEL KEYWORDS (hidden algorithm signal)", currentKeywords, newKeywords);
  diffPreview("▪ COUNTRY", currentCountry, newCountry);
  diffPreview("▪ DEFAULT LANGUAGE", currentLang, newLang);

  if (!APPLY) {
    console.log("=".repeat(80));
    console.log("DRY RUN — nothing changed on YouTube.");
    console.log("If this looks right, re-run with:\n");
    console.log("   node scripts/youtube-channel-optimize.js --apply\n");
    return;
  }

  console.log("=".repeat(80));
  console.log("APPLYING CHANGES TO YOUTUBE…\n");

  // YouTube API requires brandingSettings to be updated on its own —
  // it can't be combined with snippet or other parts.
  // For channels, description/keywords/country/language all actually live
  // under brandingSettings.channel (snippet mirrors description for reads only).
  const updateBody = {
    id: channelId,
    brandingSettings: {
      channel: {
        ...(channel.brandingSettings?.channel || {}),
        title: channel.snippet.title,
        description: newDesc,
        keywords: newKeywords,
        country: newCountry,
        defaultLanguage: newLang,
      },
    },
  };

  const upd = await ytRequest({
    accessToken: token,
    method: "PUT",
    path: "/youtube/v3/channels?part=brandingSettings",
    body: updateBody,
  });

  if (upd.status >= 400) {
    console.error(`\n✗ Failed: ${upd.status}`);
    console.error(JSON.stringify(upd.body, null, 2).slice(0, 600));
    process.exit(1);
  }

  console.log("✓ Channel updated successfully.");
  console.log("\nView the changes at: https://www.youtube.com/channel/" + channelId + "/about");
  console.log("(Search results and recommendations will start reflecting the new SEO within 24-72 hours.)");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
