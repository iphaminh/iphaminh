// scripts/youtube-reconcile.js
// One-time reconciliation: match your existing YouTube videos to Vimeo videos
// by title, then tag the matched Vimeo videos so youtube-sync.js will skip them.
//
// Usage:
//   node scripts/youtube-reconcile.js               → dry-run: print matches, no tagging
//   node scripts/youtube-reconcile.js --apply       → actually tag Vimeo videos

require("dotenv").config();
const https = require("https");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const REGISTRY_PATH = path.join(__dirname, "youtube-registry.json");

function saveRegistryEntry(vimeoId, youtubeId) {
  let parsed = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    try { parsed = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8")); }
    catch (e) { parsed = {}; }
  }
  parsed[vimeoId] = youtubeId;
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(parsed, null, 2) + "\n");
}

const VIMEO_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_USER_ID = process.env.VIMEO_USER_ID;
const YT_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
const YT_SYNC_TAG_PREFIX = "youtube:";

const APPLY = process.argv.includes("--apply");
// Comma-separated list of YouTube video IDs to exclude from reconciliation.
const SKIP_ARG = process.argv.find((a) => a.startsWith("--skip="));
const SKIP_IDS = new Set(SKIP_ARG ? SKIP_ARG.split("=")[1].split(",").map((s) => s.trim()).filter(Boolean) : []);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function httpsGet(hostname, path, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get({ hostname, path, headers }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    }).on("error", reject);
  });
}

function vimeo(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.vimeo.com", path, method,
      headers: {
        Authorization: `bearer ${VIMEO_TOKEN}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
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

async function getYouTubeAccessToken() {
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
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve(JSON.parse(d).access_token); }
        catch (e) { reject(new Error("Bad token response")); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Title matching
// ─────────────────────────────────────────────────────────────────────────────

// Words that appear in almost every title — meaningless for matching.
const STOPWORDS = new Set([
  "wedding", "film", "films", "phaminh", "cinematography", "cinematic",
  "luxury", "the", "at", "of", "on", "in", "and", "for", "with",
  "celebration", "story", "love", "video", "videography", "highlight",
  "sneak", "peek", "reel", "trailer", "final", "edit", "edited",
  "bay", "area", "arkansas", "california", "ca", "ar", "usa",
  "elopement", "engagement", "chapel", "garden", "castle",
  "a", "an", "s", "our", "her", "his",
]);

// Extract meaningful tokens (mostly proper nouns / couple names) from a title.
function extractSignatureTokens(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^\w\s'’&+]/g, " ")     // strip punctuation except word chars, apostrophes, & +
    .replace(/[+&]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
    // Filter out possessive suffixes like "morgan's"
    .map((w) => w.replace(/['’]s$/, ""));
}

// Score a match between two titles: fraction of shared meaningful tokens (Jaccard-ish).
function scoreMatch(a, b) {
  const A = new Set(extractSignatureTokens(a));
  const B = new Set(extractSignatureTokens(b));
  if (!A.size || !B.size) return 0;
  let overlap = 0;
  for (const t of A) if (B.has(t)) overlap++;
  // Weight by min set — so a 2-word overlap out of 3 words matches strongly.
  return overlap / Math.min(A.size, B.size);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAllVimeoVideos() {
  const videos = [];
  let next = `/users/${VIMEO_USER_ID}/videos?per_page=100&sort=date&direction=desc&fields=uri,name,tags`;
  while (next) {
    const { body } = await vimeo("GET", next);
    if (!body?.data) break;
    videos.push(...body.data);
    next = body.paging?.next || null;
  }
  return videos;
}

async function fetchAllYouTubeVideos(token) {
  const ch = await httpsGet("www.googleapis.com", "/youtube/v3/channels?part=contentDetails&mine=true", { Authorization: `Bearer ${token}` });
  const uploadsId = ch.body?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error("Could not find channel uploads playlist");

  const videos = [];
  let pageToken = "";
  do {
    const url = `/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${uploadsId}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const r = await httpsGet("www.googleapis.com", url, { Authorization: `Bearer ${token}` });
    videos.push(...(r.body.items || []).map((v) => ({
      id: v.contentDetails.videoId,
      title: v.snippet.title,
      publishedAt: v.contentDetails.videoPublishedAt || v.snippet.publishedAt,
    })));
    pageToken = r.body.nextPageToken || "";
  } while (pageToken);
  return videos;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const MATCH_THRESHOLD = 0.5;   // 50% of the smaller title's tokens must overlap

async function main() {
  console.log("=== YouTube ↔ Vimeo reconciliation ===\n");

  const token = await getYouTubeAccessToken();
  const [ytVideos, vimeoVideos] = await Promise.all([
    fetchAllYouTubeVideos(token),
    fetchAllVimeoVideos(),
  ]);

  console.log(`YouTube: ${ytVideos.length} videos`);
  console.log(`Vimeo:   ${vimeoVideos.length} videos\n`);

  // Vimeo videos that already have any youtube:* tag — skip them.
  const alreadyTaggedVimeo = new Set(
    vimeoVideos
      .filter((v) => (v.tags || []).some((t) => (t.name || "").startsWith(YT_SYNC_TAG_PREFIX)))
      .map((v) => v.uri.replace("/videos/", ""))
  );

  const matches = [];   // { yt, vimeo, score }
  const noMatch = [];

  for (const yt of ytVideos) {
    let best = null;
    for (const v of vimeoVideos) {
      const vimeoId = v.uri.replace("/videos/", "");
      if (alreadyTaggedVimeo.has(vimeoId)) continue;   // don't re-match videos we already reconciled
      const score = scoreMatch(yt.title, v.name);
      if (!best || score > best.score) best = { vimeo: v, vimeoId, score };
    }
    if (SKIP_IDS.has(yt.id)) {
      noMatch.push({ yt, best, skipped: true });
    } else if (best && best.score >= MATCH_THRESHOLD) {
      matches.push({ yt, vimeo: best.vimeo, vimeoId: best.vimeoId, score: best.score });
    } else {
      noMatch.push({ yt, best });
    }
  }

  console.log(`\n=== SUGGESTED MATCHES (${matches.length}) ===`);
  matches.forEach((m, i) => {
    console.log(
      `\n${(i + 1).toString().padStart(2)}. score ${m.score.toFixed(2)}\n` +
      `    YT: ${m.yt.title}\n` +
      `        https://youtu.be/${m.yt.id}\n` +
      `    VM: ${m.vimeo.name}\n` +
      `        https://vimeo.com/${m.vimeoId}`
    );
  });

  console.log(`\n=== NO CONFIDENT MATCH — YouTube-only, skipped, or unclear (${noMatch.length}) ===`);
  noMatch.forEach((m, i) => {
    const flag = m.skipped ? " [SKIPPED via --skip]" : "";
    console.log(
      `\n${(i + 1).toString().padStart(2)}. YT: ${m.yt.title}${flag} — https://youtu.be/${m.yt.id}` +
      (m.best ? `\n    (weak candidate: "${m.best.vimeo.name}" score ${m.best.score.toFixed(2)})` : "")
    );
  });

  if (!APPLY) {
    console.log(`\n\nDRY RUN — no Vimeo tags written.`);
    console.log(`Review the matches above. If they look correct, re-run with:\n`);
    console.log(`   node scripts/youtube-reconcile.js --apply\n`);
    console.log(`Only the SUGGESTED MATCHES will be tagged. Weak / no-match videos won't be touched.`);
    return;
  }

  console.log(`\n\n=== APPLYING TAGS ===`);
  let ok = 0, registry = 0;
  for (const m of matches) {
    try {
      const tag = `${YT_SYNC_TAG_PREFIX}${m.yt.id}`;
      const r = await vimeo("PUT", `/videos/${m.vimeoId}/tags/${encodeURIComponent(tag)}`, {});
      if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
      console.log(`  ✓ Tagged Vimeo ${m.vimeoId} with ${tag}`);
      ok++;
    } catch (err) {
      // Vimeo rejected the tag (usually 403 = tag limit hit). Fall back to
      // the local JSON registry — youtube-sync.js reads both.
      saveRegistryEntry(m.vimeoId, m.yt.id);
      console.log(`  ⚠ Vimeo tag rejected (${err.message}) — saved to registry: ${m.vimeoId} -> ${m.yt.id}`);
      registry++;
    }
  }
  console.log(`\n=== Done — ${ok} tagged on Vimeo, ${registry} saved to local registry ===`);
  console.log(`Those Vimeo videos will now be skipped by youtube-sync.js`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
