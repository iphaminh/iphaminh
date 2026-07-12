import path from "node:path";
import { config, requireEnv, root } from "./config.js";
import { apiJson, readJson, sleep, writeJson } from "./shared.js";

function localDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: config.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function waitForAssets(urls) {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const checks = await Promise.all(urls.map((url) => fetch(url, { method: "HEAD" }).then((r) => r.ok).catch(() => false)));
    if (checks.every(Boolean)) return;
    console.log(`Waiting for website deployment (${attempt}/20)`);
    await sleep(30000);
  }
  throw new Error("Generated images are not publicly available after 10 minutes");
}

async function publishInstagram(manifest) {
  requireEnv(["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USER_ID"]);
  const base = `https://graph.instagram.com/${config.graphVersion}/${process.env.INSTAGRAM_USER_ID}`;
  const children = [];
  for (const imageUrl of manifest.images) {
    const child = await apiJson(`${base}/media`, { method: "POST", headers: { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ image_url: imageUrl, is_carousel_item: true }) });
    children.push(child.id);
  }
  for (const childId of children) {
    for (let i = 0; i < 12; i += 1) {
      const status = await apiJson(`https://graph.instagram.com/${config.graphVersion}/${childId}?fields=status_code`, { headers: { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}` } });
      if (status.status_code === "FINISHED") break;
      if (status.status_code === "ERROR" || i === 11) throw new Error(`Instagram child container status: ${status.status_code}`);
      await sleep(5000);
    }
  }
  const container = await apiJson(`${base}/media`, { method: "POST", headers: { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ media_type: "CAROUSEL", children: children.join(","), caption: manifest.caption }) });
  for (let i = 0; i < 12; i += 1) {
    const status = await apiJson(`https://graph.instagram.com/${config.graphVersion}/${container.id}?fields=status_code`, { headers: { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}` } });
    if (status.status_code === "FINISHED") break;
    if (status.status_code === "ERROR" || i === 11) throw new Error(`Instagram container status: ${status.status_code}`);
    await sleep(5000);
  }
  const published = await apiJson(`${base}/media_publish`, { method: "POST", headers: { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ creation_id: container.id }) });
  return { id: published.id, publishedAt: new Date().toISOString() };
}

async function publishTikTok(manifest) {
  requireEnv(["TIKTOK_ACCESS_TOKEN"]);
  const creator = await apiJson("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", { method: "POST", headers: { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`, "Content-Type": "application/json; charset=UTF-8" } });
  const privacy = process.env.TIKTOK_PRIVACY_LEVEL || "PUBLIC_TO_EVERYONE";
  if (!creator.data?.privacy_level_options?.includes(privacy)) throw new Error(`TikTok privacy ${privacy} is not allowed for this account`);
  const result = await apiJson("https://open.tiktokapis.com/v2/post/publish/content/init/", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ media_type: "PHOTO", post_mode: "DIRECT_POST", post_info: { title: manifest.theme.slice(0, 90), description: manifest.caption, privacy_level: privacy, disable_comment: false, auto_add_music: true, brand_content_toggle: false, brand_organic_toggle: true }, source_info: { source: "PULL_FROM_URL", photo_images: manifest.images, photo_cover_index: 0 } }),
  });
  return { id: result.data.publish_id, publishedAt: new Date().toISOString() };
}

export async function publish() {
  const date = process.env.CONTENT_DATE || localDate();
  const manifestFile = path.join(root, "public", "social-content", date, "manifest.json");
  const manifest = await readJson(manifestFile);
  if (!manifest) throw new Error(`No generated content found for ${date}`);
  if (!config.publishEnabled) { console.log("PUBLISH_ENABLED is false; content remains ready for review"); return manifest; }
  await waitForAssets(manifest.images);
  if (!manifest.publications.instagram) manifest.publications.instagram = await publishInstagram(manifest);
  if (!manifest.publications.tiktok) manifest.publications.tiktok = await publishTikTok(manifest);
  manifest.status = "published"; manifest.publishedAt = new Date().toISOString();
  await writeJson(manifestFile, manifest);
  console.log(`Published ${date} to Instagram and TikTok`);
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) publish().catch((error) => { console.error(error.message); process.exitCode = 1; });
