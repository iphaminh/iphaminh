#!/usr/bin/env node
/**
 * fix-mislabeled.js — correct existing Vimeo and YouTube listings for weddings
 * whose location was invented by the old SEO prompts.
 *
 * Background: the old Vimeo prompt was told to work "Bay Area" into every
 * description; the old YouTube prompt then upgraded "Bay Area" to
 * "San Francisco, CA". Arkansas weddings were published as California ones.
 * src/data/weddingFacts.json holds the truth, cited from Minh's own Facebook
 * and Instagram captions.
 *
 * The bulk Vimeo job cannot fix these: vimeo-seo.js skips any title containing
 * " | ", and every mislabeled title has one. Hence this one-off corrector.
 *
 *   node scripts/fix-mislabeled.js                 # dry run, prints the diff
 *   node scripts/fix-mislabeled.js --apply         # writes to Vimeo + YouTube
 *   node scripts/fix-mislabeled.js --apply --vimeo-only
 *   node scripts/fix-mislabeled.js --list-dupes    # duplicate uploads, no writes
 *
 * Deleting duplicates is deliberately NOT automated: it is irreversible and
 * only Minh knows which copy has the watch history worth keeping.
 */

require("dotenv").config();
const { factsFor } = require("./wedding-facts");
const { generateSEO, parseSEO, vimeoRequest, updateVimeoVideo, getAllVideos } = require("./vimeo-seo");
const { generateYouTubeSEO, getYouTubeAccessToken, httpsRequestJson, coupleKeyFromTitle } = require("./youtube-sync");

const APPLY = process.argv.includes("--apply");
const VIMEO_ONLY = process.argv.includes("--vimeo-only");
const YT_ONLY = process.argv.includes("--youtube-only");
const LIST_DUPES = process.argv.includes("--list-dupes");

// A listing is wrong when it claims a place the facts contradict.
const CA_WORDS = /\b(bay area|san francisco|sf|california|napa|sonoma|sacramento|silicon valley|marin|calif\.?|,\s*ca\b)/i;
const AR_WORDS = /\b(arkansas|,\s*ar\b|bentonville|fayetteville|rogers|springdale|little rock|hot springs|nwa|northwest ar)/i;

function isMislabeled(text, facts) {
  if (!facts?.state) return false;
  const t = String(text || "");
  if (facts.state === "AR") return CA_WORDS.test(t);
  if (facts.state === "CA") return AR_WORDS.test(t);
  return false;
}

async function fetchChannelVideos(accessToken) {
  const { body: ch } = await httpsRequestJson({
    hostname: "www.googleapis.com",
    path: "/youtube/v3/channels?part=contentDetails&mine=true",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const uploads = ch?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Could not read the uploads playlist");

  const videos = [];
  let pageToken = "";
  do {
    const { body } = await httpsRequestJson({
      hostname: "www.googleapis.com",
      path: `/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploads}&maxResults=50&pageToken=${pageToken}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    for (const it of body.items || []) {
      videos.push({
        id: it.contentDetails.videoId,
        title: it.snippet.title,
        description: it.snippet.description,
        publishedAt: it.contentDetails.videoPublishedAt,
      });
    }
    pageToken = body.nextPageToken || "";
  } while (pageToken);
  return videos;
}

async function updateYouTubeVideo(accessToken, videoId, { title, description, tags }) {
  // videos.update replaces the whole snippet, so categoryId must be resent.
  const { body: current } = await httpsRequestJson({
    hostname: "www.googleapis.com",
    path: `/youtube/v3/videos?part=snippet&id=${videoId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const snippet = current?.items?.[0]?.snippet;
  if (!snippet) throw new Error(`YouTube video ${videoId} not found`);

  const { status, body } = await httpsRequestJson({
    hostname: "www.googleapis.com",
    path: "/youtube/v3/videos?part=snippet",
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: {
      id: videoId,
      snippet: {
        title: title.slice(0, 100),
        description: description.slice(0, 5000),
        tags: tags.slice(0, 20),
        categoryId: snippet.categoryId || "22",
        defaultLanguage: snippet.defaultLanguage || "en",
      },
    },
  });
  if (status >= 400) throw new Error(`YouTube update ${status}: ${JSON.stringify(body).slice(0, 200)}`);
  return body;
}

function preview(label, before, after) {
  console.log(`   ${label}`);
  console.log(`     was: ${String(before).split("\n")[0].slice(0, 95)}`);
  console.log(`     now: ${String(after).split("\n")[0].slice(0, 95)}`);
}

async function main() {
  console.log(`=== Fix mislabeled listings ===  ${APPLY ? "APPLY (writing)" : "DRY RUN (no writes)"}\n`);

  const accessToken = (VIMEO_ONLY || !process.env.YOUTUBE_REFRESH_TOKEN)
    ? null
    : await getYouTubeAccessToken();

  // ── duplicates ────────────────────────────────────────────────────────────
  if (accessToken) {
    const channel = await fetchChannelVideos(accessToken);
    const byCouple = {};
    for (const v of channel) {
      const key = coupleKeyFromTitle(v.title);
      if (!key) continue;
      (byCouple[key] ||= []).push(v);
    }
    const dupes = Object.entries(byCouple).filter(([, list]) => list.length > 1);
    if (dupes.length) {
      console.log(`⚠ ${dupes.length} couple(s) uploaded more than once:`);
      for (const [key, list] of dupes) {
        console.log(`   ${key}:`);
        for (const v of list) {
          console.log(`     https://youtu.be/${v.id}  ${v.publishedAt?.slice(0, 10)}  ${v.title.slice(0, 70)}`);
        }
      }
      console.log(`   Deletion is manual on purpose — keep the copy with the watch time.\n`);
    } else {
      console.log("✓ No duplicate couples on the channel\n");
    }
    if (LIST_DUPES) return;
  }

  // ── Vimeo ─────────────────────────────────────────────────────────────────
  if (!YT_ONLY) {
    const videos = await getAllVideos();
    const wrong = videos
      .map((v) => ({ v, facts: factsFor(v.name) }))
      .filter(({ v, facts }) => facts && isMislabeled(`${v.name} ${v.description || ""}`, facts));

    console.log(`Vimeo: ${videos.length} videos, ${wrong.length} contradict the cited facts`);
    for (const { v, facts } of wrong) {
      const id = v.uri.replace("/videos/", "");
      console.log(`\n▶ Vimeo ${id} — ${facts.couple} (truth: ${facts.venue || "?"}, ${[facts.city, facts.state].filter(Boolean).join(", ")})`);
      const seo = parseSEO(await generateSEO(v));
      if (!seo.title || !seo.description) {
        console.warn("   ⚠ generator returned nothing usable, skipped");
        continue;
      }
      preview("title", v.name, seo.title);
      preview("description", v.description || "(none)", seo.description);
      console.log(`     tags: ${seo.tags.slice(0, 8).join(", ")}`);
      if (APPLY) {
        await updateVimeoVideo(v.uri, seo);
        console.log("   ✅ Vimeo updated");
      }
    }
  }

  // ── YouTube ───────────────────────────────────────────────────────────────
  if (accessToken && !VIMEO_ONLY) {
    const channel = await fetchChannelVideos(accessToken);
    const wrong = channel
      .map((v) => ({ v, facts: factsFor(v.title) }))
      .filter(({ v, facts }) => facts && isMislabeled(`${v.title} ${v.description || ""}`, facts));

    console.log(`\nYouTube: ${channel.length} videos, ${wrong.length} contradict the cited facts`);
    for (const { v, facts } of wrong) {
      console.log(`\n▶ YouTube ${v.id} — ${facts.couple} (truth: ${facts.venue || "?"}, ${[facts.city, facts.state].filter(Boolean).join(", ")})`);
      const seo = await generateYouTubeSEO(v.title, v.description, null);
      preview("title", v.title, seo.title);
      preview("description", v.description || "(none)", seo.description);
      console.log(`     tags: ${seo.tags.slice(0, 8).join(", ")}`);
      if (APPLY) {
        await updateYouTubeVideo(accessToken, v.id, seo);
        console.log("   ✅ YouTube updated");
      }
    }
  }

  console.log(APPLY ? "\n=== Done ===" : "\n=== Dry run only. Re-run with --apply to write. ===");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal:", err.message || err);
    process.exit(1);
  });
}
