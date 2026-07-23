---
name: business-seo-automation
description: Bootstrap a complete AI-powered content SEO + multi-platform publishing system for a business (like the Phaminh Cinematography setup). Use when the user wants to set up automated SEO, Vimeo→YouTube syncing, Notion logging, or content automation for a new/existing business. Triggers - "set up SEO automation", "apply the phaminh system", "new business automation", "bootstrap content pipeline".
---

# Business SEO Automation System

Recreate the battle-tested Phaminh Cinematography automation stack for a new business.
The canonical, living implementation is at `/Users/minhpham/Documents/GitHub/iphaminh`
(GitHub: `iphaminh/iphaminh`) — copy scripts from there and adapt; do not rewrite from scratch.

## What the system does

```
Owner uploads content to primary platform (e.g. Vimeo)
    ↓
GitHub Action cron #1 (every 6h): Claude generates SEO (title/description/tags)
    → updates the platform via API → refreshes website data JSON → auto-commits
    ↓
GitHub Action cron #2 (audience-optimized days/times): syncs 1 item per run to
    secondary platform (e.g. YouTube) with platform-tuned SEO + thumbnail
    ↓
Every processed item logged to a Notion database
    ↓
Website (React SPA) prerendered to static HTML per route → deployed via FTP
```

## Phase 0 — Interview the user first

Ask (don't assume):
1. Business name, owner, website, contact email/phone
2. Service areas / target locations (drives ALL keyword generation)
3. Primary content platform + account tier (Vimeo Plus? Pro? YouTube-first?)
4. Secondary platforms to syndicate to (YouTube? later IG/TikTok — note IG needs
   9:16 vertical re-edits and a Meta Business app; usually defer it)
5. Target audience + when they browse (drives the posting cron). For weddings:
   couples browse Sun evenings + Tue-Thu 7-10pm local; NEVER Fri/Sat.
6. Existing accounts: GitHub repo, Notion workspace, Anthropic API key, hosting

## Phase 1 — Credentials (the painful part; do it right)

| Credential | Where | Gotchas learned the hard way |
|---|---|---|
| Platform API token (Vimeo etc.) | platform dev console | Verify scope AND account tier — Vimeo Plus/Starter exposes NO download links via API regardless of scope |
| ANTHROPIC_API_KEY | console.anthropic.com | Use claude-sonnet-4-6 for template SEO generation. Opus costs 5-13x more with no quality gain for structured output. Set a billing alert. |
| Google OAuth (YouTube) | console.cloud.google.com | **CRITICAL: publish the OAuth consent app to "In production" immediately.** Testing mode kills refresh tokens after 7 days (caused a silent 5-day outage). Client type: Desktop app. Scopes: youtube.upload + youtube. Note WHICH GCP project holds the client — easy to lose. |
| YouTube refresh token | run `scripts/youtube-auth.js` (local browser consent flow, port 3457) | Refresh token is bound to the client secret that issued it — regenerating the secret orphans old tokens. Update BOTH GitHub secrets together. |
| NOTION_API_KEY + DATABASE_ID | notion.so/profile/integrations | Must connect the integration to the database (⋯ → Connections). DB needs columns: Title(title), URL(url), Status(select), Date(date). |
| GH_PAT | GitHub settings | Workflows that push commits need GH_PAT on checkout — the default GITHUB_TOKEN is read-only (exit 128 on push). |
| VIMEO_COOKIES_B64 | export from logged-in Chrome | See cookie procedure below. |

### Vimeo cookie procedure (required for download on Plus/Starter tier)
1. `yt-dlp --cookies-from-browser chrome --cookies /tmp/all.txt --skip-download <any vimeo url>`
2. Filter to vimeo.com domains ONLY (never ship other sites' session cookies):
   `grep -E "^\.?(vimeo\.com|.*\.vimeo\.com)\s" /tmp/all.txt`
3. Store gitignored at repo root; set `VIMEO_COOKIES_PATH` in `.env`
4. For GitHub: **base64-encode it** (`base64 -i file | tr -d '\n'`) → secret `VIMEO_COOKIES_B64`.
   Plain text FAILS: GitHub's UI paste destroys the TAB separators Netscape format requires.
   Workflow decodes with `tr -d ' \n\r\t' | base64 -d` (strip whitespace first).
5. Cookies last as long as the browser session (~months). On expiry the sync error
   says exactly what to do.

## Phase 2 — Scripts (copy from iphaminh/scripts/, adapt the prompts)

| Script | Purpose | Key adaptations for new business |
|---|---|---|
| `vimeo-seo.js` | bulk SEO on primary platform | Rewrite the Claude prompt: business name, service areas, brand voice. Keep the " \| " skip-marker idempotency pattern. |
| `youtube-sync.js` | download → SEO → upload → tag → log | Platform-tuned prompt differs from primary (front-load intent keywords). Keep: yt-dlp `%(ext)s` output template + scan-dir-for-produced-file (merge changes extensions!), tag sanitization (strip quotes/colons/pipes, 450-char cap), duration-constrained timestamps (skip chapters if <2min). |
| `youtube-auth.js` | one-time OAuth consent | Works as-is. |
| `youtube-reconcile.js` | match pre-existing uploads to prevent duplicates | Run BEFORE first sync. Dry-run first; review fuzzy matches manually (e.g. two different Vietnamese weddings matched on the word "vietnamese"); use `--skip=<id>` for false positives. |
| `youtube-channel-optimize.js` | channel About/keywords/country | Update brand facts in prompt. Note: channel updates go via `part=brandingSettings` ALONE — the API rejects combining it with snippet. |
| `notion-log.js` | Notion rows | Must THROW on missing env, never process.exit (exit kills the whole sync; throw is caught as non-fatal). |
| `update-cine-gallery.js` | platform data → website JSON | Adapt output path/shape to the new site. |
| `prerender.js` | static HTML per route for SEO | React SPAs serve an empty shell — Google indexes ~nothing without this. Writes per-route index.html with meta/OG/JSON-LD + noscript content after build. |

Scripts folder has its own `package.json` (dotenv, @anthropic-ai/sdk) — keeps the
website's npm ci fast. Workflow runs `npm ci && cd scripts && npm install`.

## Phase 3 — Workflows (copy .github/workflows/seo-automation.yml)

- Two crons in ONE workflow, discriminated by `github.event.schedule == '<expr>'`
  in each job's `if:` — otherwise both fire on both schedules.
- Publishing cron: pick days/times from the audience interview. Wedding default:
  `0 23 * * 0,2` (Sun+Tue 23:00 UTC = 4pm PT / 6pm CT — 2-4h before evening peak).
  One item per run (`--limit=1`); platforms punish batch-dumping back-catalogs.
- `concurrency:` group so a slow run can't collide with the next cron.
- yt-dlp: install the NIGHTLY (`pip install --user --pre "yt-dlp[default]"`) —
  Vimeo breaks the extractor regularly; fixes land in nightly first.
- Auto-commit steps: `git pull --rebase origin main` before `git push` (crons and
  humans race constantly).
- If deploy uses FTP + repo has LFS files: `checkout with lfs: true` or the site
  ships 132-byte pointer files (broke the hero video for a week).

## Phase 4 — Duplicate protection (before first automated run!)

Two layers, both required:
1. Platform-side tag on source item: `youtube:<id>` after successful sync
2. Committed JSON registry `scripts/youtube-registry.json` — fallback because
   platforms cap tags (Vimeo 403s at ~100 tags/video), and it survives platform resets
The sync checks BOTH. Reconcile pre-existing uploads first (Phase 2 table).

## Phase 5 — Verify end-to-end

1. Local single-item test: `node scripts/youtube-sync.js <specific_id>` (pick the
   SHORTEST item — fastest feedback loop)
2. Cloud test: workflow_dispatch with the sync checkbox → must go green in Actions
3. Confirm on the platform: item live, title/desc/tags correct, thumbnail set
4. Check Notion row + registry/tag written
5. Only then let the cron take over

## Known failure signatures → instant diagnosis

| Symptom | Cause |
|---|---|
| `invalid_grant: Token has been expired or revoked` | OAuth app in Testing mode (7-day death) or client secret regenerated |
| `Unable to download ... 401 Unauthorized` from yt-dlp | Cookies missing/expired |
| `yt-dlp finished but output file not found` | Fixed `-o x.mp4` + stream merge → use `%(ext)s` template + dir scan |
| git push exit 128 in Action | GITHUB_TOKEN instead of GH_PAT |
| `invalid video keywords` from YouTube | Unsanitized tags (quotes/colons/pipes) or >500 chars total |
| Whole sync dies on Notion error | process.exit in logger instead of throw |
| base64: invalid input in workflow | Whitespace in pasted secret — decode must `tr -d ' \n\r\t'` first |
| Claude `credit balance is too low` | Top up; also check the cron hasn't been burning Opus |

## Cost expectations
~$0.02-0.05 per item SEO (Sonnet). ~8-10 items/month ≈ well under $1/month.
YouTube quota: 1600 units/upload, 10k/day, resets midnight Pacific (~6 uploads/day max).
