require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");

const VIMEO_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_USER_ID = process.env.VIMEO_USER_ID || "minhpham";
const OUTPUT_PATH = path.join(__dirname, "../src/data/vimeo-videos.json");

function vimeoGet(apiPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vimeo.com",
      path: apiPath,
      method: "GET",
      headers: {
        Authorization: `bearer ${VIMEO_TOKEN}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
    };
    const req = https.request(options, (res) => {
      res.setEncoding("utf8"); // prevent multi-byte characters splitting across chunks
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Failed to parse Vimeo response")); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function bestThumbnail(video) {
  const pictures = video.pictures;
  if (pictures && pictures.sizes && pictures.sizes.length > 0) {
    const sorted = [...pictures.sizes].sort((a, b) => b.width - a.width);
    return sorted[0].link;
  }
  const id = video.uri.replace("/videos/", "");
  return `https://vumbnail.com/${id}.jpg`;
}

async function fetchAllVideos() {
  const videos = [];
  let nextPage = `/users/${VIMEO_USER_ID}/videos?per_page=100&sort=date&direction=desc&fields=uri,name,description,pictures,release_time,duration`;

  while (nextPage) {
    console.log(`Fetching: ${nextPage}`);
    const data = await vimeoGet(nextPage);

    if (!data.data) {
      console.error("Unexpected Vimeo response:", JSON.stringify(data).slice(0, 200));
      break;
    }

    for (const video of data.data) {
      const id = video.uri.replace("/videos/", "");
      videos.push({
        id,
        title: video.name || "Wedding Film",
        description: video.description || "",
        thumbnailUrl: bestThumbnail(video),
        vimeoUrl: `https://vimeo.com/${id}`,
        // Feed the VideoObject schema on /cine/:slug pages (via
        // src/data/filmEnrichment.js) — real dates/durations instead of
        // placeholders. duration is in seconds.
        releaseTime: video.release_time || null,
        duration: typeof video.duration === "number" ? video.duration : null,
      });
    }

    nextPage = data.paging && data.paging.next ? data.paging.next : null;
  }

  return videos;
}

async function main() {
  console.log("=== Updating CineGallery video data from Vimeo ===");

  if (!VIMEO_TOKEN) {
    console.error("Missing VIMEO_ACCESS_TOKEN in environment");
    process.exit(1);
  }

  const videos = await fetchAllVideos();
  console.log(`Fetched ${videos.length} videos`);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(videos, null, 2));
  console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
