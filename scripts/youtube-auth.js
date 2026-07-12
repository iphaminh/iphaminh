// scripts/youtube-auth.js
// One-time OAuth 2.0 consent flow for the YouTube Data API.
//
// Run once: `node scripts/youtube-auth.js`
//   1. Opens your browser to the Google consent screen
//   2. You click "Allow"
//   3. Google redirects back to http://localhost:3457 with an auth code
//   4. We exchange the code for a refresh token
//   5. Writes the refresh token into .env as YOUTUBE_REFRESH_TOKEN
//
// After this, the refresh token never expires (unless you revoke it in
// Google Account settings), and youtube-sync.js can upload forever
// without any browser interaction.

require("dotenv").config();
const http = require("http");
const https = require("https");
const { URL } = require("url");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3457/callback";
const PORT = 3457;
const ENV_PATH = path.join(__dirname, "..", ".env");

// Scopes needed for uploading videos AND updating metadata (title, description, tags, thumbnail)
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",  // upload videos
  "https://www.googleapis.com/auth/youtube",         // manage own videos
].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in .env");
  process.exit(1);
}

function openBrowser(url) {
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.log("\nOpen this URL manually in your browser:");
      console.log(url);
    }
  });
}

function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString();

    const req = https.request(
      {
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(`${parsed.error}: ${parsed.error_description || ""}`));
            resolve(parsed);
          } catch (e) {
            reject(new Error("Bad response from Google: " + data.slice(0, 200)));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function writeRefreshTokenToEnv(refreshToken) {
  let env = fs.readFileSync(ENV_PATH, "utf8");
  if (env.match(/^YOUTUBE_REFRESH_TOKEN=.*/m)) {
    env = env.replace(/^YOUTUBE_REFRESH_TOKEN=.*/m, `YOUTUBE_REFRESH_TOKEN=${refreshToken}`);
  } else {
    env += `\nYOUTUBE_REFRESH_TOKEN=${refreshToken}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);
  console.log(`✓ Wrote YOUTUBE_REFRESH_TOKEN to .env`);
}

function fetchChannelInfo(accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "www.googleapis.com",
        path: "/youtube/v3/channels?part=snippet,statistics&mine=true",
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error("Bad channel response")); }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPES,
      access_type: "offline",     // required to receive a refresh_token
      prompt: "consent",          // force consent screen so we get a fresh refresh_token
    }).toString();

  console.log("=== YouTube OAuth Setup ===\n");
  console.log("Opening your browser for consent...");
  console.log("If it doesn't open automatically, paste this URL:\n");
  console.log(authUrl + "\n");

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== "/callback") {
      res.writeHead(404); res.end("Not found");
      return;
    }

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>OAuth error: ${error}</h1><p>Close this tab and try again.</p>`);
      console.error("OAuth error:", error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400); res.end("Missing code");
      return;
    }

    try {
      console.log("\n✓ Auth code received. Exchanging for tokens...");
      const tokens = await exchangeCodeForTokens(code);

      if (!tokens.refresh_token) {
        throw new Error(
          "No refresh_token in response. If you already consented before, " +
          "revoke access at https://myaccount.google.com/permissions and re-run."
        );
      }

      writeRefreshTokenToEnv(tokens.refresh_token);

      // Optional: fetch channel info to confirm we're connected to the right account
      const channelInfo = await fetchChannelInfo(tokens.access_token);
      const channel = channelInfo.items && channelInfo.items[0];
      const channelName = channel ? channel.snippet.title : "(unknown)";
      const subs = channel ? channel.statistics.subscriberCount : "?";

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html><body style="font-family:sans-serif;max-width:500px;margin:3rem auto;text-align:center">
          <h1>✅ YouTube Connected</h1>
          <p><strong>Channel:</strong> ${channelName}<br/>
          <strong>Subscribers:</strong> ${subs}</p>
          <p>Refresh token saved to <code>.env</code>. You can close this tab.</p>
        </body></html>
      `);

      console.log(`\n✅ Connected to YouTube channel: ${channelName} (${subs} subscribers)`);
      console.log(`\nAdd YOUTUBE_REFRESH_TOKEN to GitHub Secrets so the Action can use it in the cloud.`);
      console.log(`Token: ${tokens.refresh_token}\n`);

      server.close();
      process.exit(0);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Error: ${err.message}</h1>`);
      console.error("\nToken exchange failed:", err.message);
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    openBrowser(authUrl);
    console.log(`Local server listening on http://localhost:${PORT}\n(Waiting for Google to redirect back...)`);
  });
}

main();
