# Phaminh Cinematography — Claude Master Reference

Read this file first. It contains everything needed to understand, maintain, and extend this system.

---

## 1. BUSINESS

- **Company:** Phaminh Cinematography
- **Owner:** Minh Pham (goes by Minh)
- **Service:** Luxury wedding videography
- **Service areas:** San Francisco Bay Area CA · Napa CA · Mountain View CA · Bentonville AR · Northwest Arkansas · Hot Springs AR
- **Website:** https://www.phaminh.com
- **YouTube:** https://www.youtube.com/@Phaminh-Cinematography
- **Vimeo:** https://vimeo.com/minhpham
- **Instagram:** https://www.instagram.com/phaminh/

---

## 2. SYSTEM ARCHITECTURE

```
New video uploaded to Vimeo
        ↓
GitHub Action triggers every 6 hours (seo-automation.yml)
        ↓
scripts/vimeo-seo.js fetches all videos via Vimeo API
        ↓
Skips videos already in SEO format (title contains " | ")
        ↓
Claude AI (claude-sonnet-4-6) generates:
  - SEO title (60 chars max, location + keywords)
  - 700+ word description (emotion, vendors, location SEO, CTA)
  - 20 tags (location, style, venue, wedding keywords)
        ↓
Vimeo API updated via PATCH /videos/{id}
        ↓
scripts/notion-log.js logs Video Title, Vimeo URL, Status, Date to Notion DB
        ↓
scripts/update-cine-gallery.js fetches all 100+ videos → writes src/data/vimeo-videos.json
        ↓
GitHub Action commits vimeo-videos.json back to repo (only when data actually
changed — the commit triggers deploy.yml so the live gallery stays current)
        ↓
On every push to main → deploy.yml builds React app → FTP deploys to Hostinger
        ↓
phaminh.com/cine reads from src/data/films.js (curated) and src/data/vimeo-videos.json (auto)
```

**Two data sources for the gallery:**
- `src/data/films.js` — curated showcase films with slug, location, vendor info, individual pages at `/cine/:slug`
- `src/data/vimeo-videos.json` — auto-updated raw data (all 100+ videos) with real thumbnails from Vimeo API

---

## 3. KEY FILES

| File | Purpose |
|------|---------|
| `scripts/vimeo-seo.js` | Main SEO automation. Fetches all Vimeo videos, generates SEO content via Claude AI, updates Vimeo, logs to Notion. Skips videos already formatted (title has ` | `). |
| `scripts/update-cine-gallery.js` | Fetches all Vimeo videos with pagination → writes `src/data/vimeo-videos.json` with id, title, description, thumbnailUrl, vimeoUrl. |
| `scripts/notion-log.js` | Creates a row in the Notion "Phaminh Wedding Films" database. Properties: Video Title (title), Vimeo URL (url), Status (select), Date Processed (date). Can also be called as CLI: `node scripts/notion-log.js "Title" "https://vimeo.com/ID"`. |
| `scripts/seo-automation.js` | Per-video SEO + adds film to `src/data/films.js` + updates sitemap. Used by the manual `single-video-seo` job (triggered with a specific Vimeo URL). |
| `scripts/youtube-sync.js` | Vimeo → YouTube sync. Downloads via yt-dlp, generates YouTube-tuned SEO with Claude, resumable-uploads, sets thumbnail, tags the Vimeo video `youtube:<id>` (or falls back to `youtube-registry.json`) so it's never re-uploaded. Runs every 5 days via the `youtube-sync` job (`--limit=1`). |
| `scripts/youtube-auth.js` | One-time OAuth flow to mint `YOUTUBE_REFRESH_TOKEN`. Re-run locally if the sync fails with `invalid_grant`, then update the GitHub secret. |
| `scripts/youtube-registry.json` | Fallback vimeoId → youtubeId map (used when Vimeo tag writes fail). Committed back by the workflow when it changes. |
| `scripts/package.json` | Scripts subfolder has its own dependencies: `@anthropic-ai/sdk`, `dotenv`. Run `cd scripts && npm install` to install. |
| `.github/workflows/deploy.yml` | Triggers on every push to `main`. Runs `npm ci` → `npm run build` → FTP deploys `build/` to Hostinger `/domains/phaminh.com/public_html/`. |
| `.github/workflows/seo-automation.yml` | Three jobs: (1) `single-video-seo` — manual trigger with a Vimeo URL, adds to films.js; (2) `bulk-seo-refresh` — scheduled every 6 hours, runs all three SEO scripts; (3) `youtube-sync` — every 5 days at 14:00 UTC, syncs one Vimeo video to YouTube. All use `GH_PAT` for git push. |
| `src/pages/CineGallery/CineGallery.js` | Gallery page. Hero carousel (4 hardcoded featured films) + grid (from `src/data/films.js`). Each grid thumbnail links to `/cine/:slug` for SEO-indexable individual film pages. |
| `src/data/films.js` | Curated film list. Each entry has: slug, vimeoId, title, location, date, description, vendor credits. Edit manually when adding featured films. |
| `src/data/vimeo-videos.json` | Auto-updated by GitHub Action. Do not edit manually — it gets overwritten every 6 hours. |
| `src/data/blogPosts.js` | 12 SEO blog articles targeting Bay Area, Napa, Silicon Valley, and Arkansas keywords. Content supports `**bold**`, `- ` lists, and `[text](url)` internal links. |
| `public/llms.txt` | AI-search (AEO) summary of the business for LLM crawlers — update when service areas or pricing change. |
| `src/data/locations.json` | Local-SEO landing page content for 8 NorCal markets (Napa, Sonoma, SF, Silicon Valley, Carmel/Big Sur, Half Moon Bay, Marin, Tahoe). Read by both `LocationPage.js` and `prerender.js`. Add a new market by adding an entry here — routes, prerender, and sitemap pick it up automatically. |
| `src/pages/LocationPage/LocationPage.js` | Renders `/wedding-videographer` (hub) and `/wedding-videographer/:slug` from `locations.json`, with FAQPage + Service JSON-LD. |
| `public/sitemap.xml` | Updated by `seo-automation.js` when new films are added. |
| `public/.htaccess` | HTTPS enforcement, www redirect, React SPA routing. |

---

## 4. ENVIRONMENT SECRETS

All secrets live in two places: **GitHub repo Settings → Secrets** and the local **`.env` file** (not committed to git).

| Secret | Value / Notes |
|--------|--------------|
| `VIMEO_ACCESS_TOKEN` | Vimeo API token with edit scope |
| `VIMEO_USER_ID` | `minhpham` |
| `ANTHROPIC_API_KEY` | Claude AI API key for SEO generation |
| `NOTION_API_KEY` | Notion integration token (starts with `ntn_...`). Integration name: "Phaminh SEO Bot" |
| `NOTION_DATABASE_ID` | `9ad7c7727ea0469f88007edd9588b6da` — the Phaminh Wedding Films Notion database |
| `FTP_SERVER` | Hostinger FTP server address |
| `FTP_USERNAME` | Hostinger FTP username |
| `FTP_PASSWORD` | Hostinger FTP password |
| `GH_PAT` | GitHub Personal Access Token — used by Actions to push commits back to repo |
| `YOUTUBE_CLIENT_ID` | Google Cloud OAuth client for the YouTube Data API |
| `YOUTUBE_CLIENT_SECRET` | Google Cloud OAuth client secret |
| `YOUTUBE_REFRESH_TOKEN` | Long-lived token minted by `scripts/youtube-auth.js`. If sync fails with `invalid_grant`, re-run that script and update this secret. |
| `VIMEO_COOKIES` | Netscape-format vimeo.com cookies from Minh's browser (Edge). Needed because Vimeo Plus has no API file access and yt-dlp requires a logged-in session. Expires after months — when sync fails with "VIMEO_COOKIES secret is missing or expired", re-export (see §6). |

**Local `.env` file** (recreate on each machine — never committed):
```
VIMEO_ACCESS_TOKEN=...
VIMEO_USER_ID=minhpham
ANTHROPIC_API_KEY=...
NOTION_DATABASE_ID=9ad7c7727ea0469f88007edd9588b6da
NOTION_API_KEY=...
```

**Notion setup requirement:** The "Phaminh SEO Bot" integration must be connected to the database. Open the Notion database → `...` menu → Connections → Add "Phaminh SEO Bot".

---

## 5. MULTI-MACHINE SETUP

Minh works across two machines: **MacBook Pro (laptop)** and **Mac Studio (desktop)**.

**Rules:**
- Always `git push` before closing a machine or switching
- Always `git pull` at the start of a session on a different machine
- The `.env` file is NOT in git — it must exist on each machine manually
- Run `npm install` and `cd scripts && npm install` after first clone on a new machine

**If things get out of sync:**
```bash
git fetch origin
git status          # see what's different
git pull origin main
```

---

## 6. COMMON TASKS

**Test SEO on the 5 most recent videos locally:**
```bash
node scripts/vimeo-seo.js
```

**Process a specific video by ID:**
```bash
node scripts/vimeo-seo.js 1162740145
```

**Refresh the gallery JSON:**
```bash
node scripts/update-cine-gallery.js
```

**Log a video to Notion manually:**
```bash
node scripts/notion-log.js "Video Title" "https://vimeo.com/ID" "Processed"
```

**Trigger bulk SEO run in the cloud (no laptop needed):**
GitHub → Actions → "Phaminh SEO Automation" → "Run workflow" → leave URL blank → Run

**Refresh the VIMEO_COOKIES secret (when YouTube sync says cookies expired):**
```bash
# Be logged into vimeo.com in Edge first. Extracts, filters to vimeo-only, copies to clipboard:
yt-dlp --cookies-from-browser edge --cookies /tmp/vc-full.txt --simulate "https://vimeo.com/VIDEO_ID"
{ echo "# Netscape HTTP Cookie File"; grep -E '^\.?([a-z0-9-]+\.)*vimeo\.com\s' /tmp/vc-full.txt; } | pbcopy
rm /tmp/vc-full.txt
```
Then GitHub → Settings → Secrets → Actions → `VIMEO_COOKIES` → Update → paste.

**Force-sync one specific video to YouTube:**
```bash
node scripts/youtube-sync.js 1162740145
```
(or GitHub → Actions → "Phaminh SEO Automation" → "Run workflow" → check "Also run YouTube sync")

**Add a new featured film to the gallery:**
GitHub → Actions → "Phaminh SEO Automation" → "Run workflow" → paste Vimeo URL → Run
(This runs `seo-automation.js` which adds the film to `src/data/films.js` and updates the sitemap)

---

## 7. MINH'S PREFERENCES

- **Communication style:** Step by step with confirmation checkpoints. Don't ask to recreate things that already exist — check first.
- **Workflow:** Simplest path possible. Avoid over-engineering.
- **Aesthetic:** Dark gold / cinematic luxury — consistent with the Phaminh brand.
- **Git discipline:** Always pull before starting, always push when done.
- **Automation first:** If it can run in the cloud (GitHub Actions), it should — laptop should not need to be open.
- **Name:** Goes by Minh.

---

## 8. ARCHITECTURE DECISIONS & WHY

| Decision | Reason |
|----------|--------|
| `scripts/` has its own `package.json` | Keeps Node automation deps separate from the React app. `npm ci` on the React app stays fast and clean. |
| SEO skips titles containing ` \| ` | Idempotent — re-running never overwrites already-optimized titles. Safe to run every 6 hours. |
| `GH_PAT` instead of `GITHUB_TOKEN` for git push | `GITHUB_TOKEN` has read-only permissions by default in this repo config. `GH_PAT` has full write access needed to push commits from Actions. |
| Two gallery data sources (`films.js` + `vimeo-videos.json`) | `films.js` = curated showcase with SEO slugs and individual pages. `vimeo-videos.json` = complete raw feed for thumbnails and metadata. Both serve different purposes. |
| `process.exit(1)` removed from `notion-log.js` | Using `throw new Error()` instead so missing Notion credentials are caught gracefully by `vimeo-seo.js` — Notion failure is non-fatal and should not stop SEO updates. |
| `res.setEncoding("utf8")` on every https response | Node emits raw Buffers by default; appending them to a string can split multi-byte UTF-8 chars across chunk boundaries, corrupting `—` into `��`. This caused mojibake and made vimeo-videos.json "change" every run. |
| `require.main === module` guard in `vimeo-seo.js` | Requiring the module (e.g. for a syntax check) must not launch a full SEO run. The workflow verify step previously did exactly that, running bulk SEO twice per cycle. |
| No `[skip ci]` on vimeo-videos.json auto-commits | The gallery JSON is baked into the React build at deploy time. With `[skip ci]`, fresh data never reached the live site. Commits only happen when data actually changed, so deploys stay rare. |

---

## NEW BUSINESS TEMPLATE

Copy this prompt to set up the same Vimeo SEO automation system for any new client:

```
I'm building a Vimeo SEO automation system for [BUSINESS NAME].

BUSINESS INFO:
- Owner: [NAME]
- Service: [TYPE OF BUSINESS]
- Service areas: [LOCATION 1], [LOCATION 2]
- Website: [URL]
- Vimeo user ID: [VIMEO_USERNAME]

EXISTING SETUP:
- React app deployed to [HOSTING PROVIDER] via [DEPLOY METHOD]
- GitHub repo: [REPO URL]
- .env has: VIMEO_ACCESS_TOKEN, VIMEO_USER_ID, ANTHROPIC_API_KEY

TASKS:
1. Create scripts/vimeo-seo.js — fetches all Vimeo videos, generates SEO title/description/tags
   via Claude AI tuned for [BUSINESS TYPE] keywords, updates Vimeo via API, skips already-formatted
   titles (containing " | "), logs each update to Notion
2. Create scripts/update-gallery.js — fetches all videos from Vimeo API with pagination,
   writes src/data/vimeo-videos.json with id, title, description, thumbnailUrl, vimeoUrl
3. Create scripts/notion-log.js — creates Notion DB rows with: Title, URL, Status, Date
4. Create .github/workflows/seo-automation.yml — runs every 6 hours + manual trigger,
   uses GH_PAT (not GITHUB_TOKEN) for git push, passes all secrets as env vars
5. Update the gallery page to use src/data/vimeo-videos.json instead of hardcoded video arrays
6. Add all secrets to .env and GitHub repo secrets:
   VIMEO_ACCESS_TOKEN, VIMEO_USER_ID, ANTHROPIC_API_KEY,
   NOTION_API_KEY, NOTION_DATABASE_ID, GH_PAT

SEO STYLE FOR CLAUDE PROMPT:
- Title format: [Couple Name] | [Venue/Style] Wedding Film | [Location]
- Description: 700+ words, emotional opening, vendor credits, location keywords,
  [BUSINESS NAME] branding, call to action with website URL, hashtags
- Tags: 20 tags mixing location, style, venue name, wedding keywords

KNOWN GOTCHAS TO AVOID:
- Use GH_PAT not GITHUB_TOKEN for git push steps in Actions
- notion-log.js must throw Error (not process.exit) so failures are non-fatal
- scripts/ needs its own package.json with dotenv dependency
- Run: npm ci && cd scripts && npm install in the workflow install step
- Always res.setEncoding("utf8") before accumulating https response chunks —
  otherwise multi-byte characters split across chunks become mojibake (��)
- Guard script entry points with `if (require.main === module)` so requiring
  the file (syntax checks, imports) never triggers a full run
- Don't put [skip ci] on data commits the site build depends on — the deploy
  will never pick them up
```
