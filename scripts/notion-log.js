require("dotenv").config();
const https = require("https");

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

function notionRequest(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.notion.com",
      path: apiPath,
      method,
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
        ...(bodyStr && { "Content-Length": Buffer.byteLength(bodyStr) }),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Failed to parse Notion response")); }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

/**
 * Log a processed video to a Notion database.
 * The database must have these properties:
 *   Video Title  (title)
 *   Vimeo URL    (url)
 *   Status       (select)
 *   Date Processed (date)
 */
async function logVideoToNotion({ videoTitle, vimeoUrl, status = "Processed" }) {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error("Missing NOTION_API_KEY or NOTION_DATABASE_ID");
    process.exit(1);
  }

  const today = new Date().toISOString().split("T")[0];

  const page = await notionRequest("POST", "/v1/pages", {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      "Video Title": {
        title: [{ text: { content: videoTitle } }],
      },
      "Vimeo URL": {
        url: vimeoUrl,
      },
      "Status": {
        select: { name: status },
      },
      "Date Processed": {
        date: { start: today },
      },
    },
  });

  if (page.object === "error") {
    throw new Error(`Notion error: ${page.message}`);
  }

  return page;
}

// Allow calling directly: node scripts/notion-log.js "Video Title" "https://vimeo.com/123" "Processed"
if (require.main === module) {
  const [, , title, url, status] = process.argv;
  if (!title || !url) {
    console.error('Usage: node scripts/notion-log.js "Video Title" "https://vimeo.com/ID" [Status]');
    process.exit(1);
  }
  logVideoToNotion({ videoTitle: title, vimeoUrl: url, status })
    .then((page) => console.log(`Logged to Notion: ${page.id}`))
    .catch((err) => { console.error(err.message); process.exit(1); });
}

module.exports = { logVideoToNotion };
