---
name: phaminh-status
description: Resume work on the Phaminh automation project. Loads current state, pending tasks, and the operational runbook (workflow monitoring, token/cookie refresh, YouTube sync). Use at the start of a session or whenever Minh asks "where are we at".
---

# Phaminh Ops — Session Resume & Runbook

## How to use this skill
1. Read **Current state** and **Pending next steps** below.
2. `git pull origin main` and skim `git log --oneline -10` for anything new.
3. Check the latest Actions runs (commands in Runbook — mind the 60/hr unauthenticated API rate limit).
4. Give Minh a short "here's where we are" summary, then continue the pending work.
5. **At the end of every session: update the Current state + Pending sections in this file, commit, and push.** That is what makes the next session seamless.

## Current state (updated 2026-07-25)

**Healthy and running:**
- Vimeo SEO automation (6-hour cron): fixed and verified — UTF-8 chunk corruption fixed everywhere (`res.setEncoding("utf8")`), no more churn commits, double-run bug fixed (`require.main` guard), real data changes now auto-deploy to the live site (no more `[skip ci]` starvation).
- Deploy pipeline: `npm ci` + cache, verified green.
- Gallery JSON: clean (the 4 "missing" videos were private, not deleted — cloud token sees 107, public token sees 103).

**YouTube sync — rebuilt, one step from working:**
- Root causes found and fixed: (1) YouTube OAuth refresh token was revoked (`invalid_grant`) — fresh token minted 2026-07-22 via `scripts/youtube-auth.js`, verified working, GitHub secret updated. (2) Vimeo locked out yt-dlp anonymous downloads AND Vimeo Plus has no API file access (`download`/`files`/`play` all empty even with `video_files` scope) — solved via browser-cookie downloads (Minh's Edge login), tested locally end-to-end.
- Code pushed through commit `abaf2a0f` (cookie support, HLS merge format, loud failure messages, registry duplicate guards).

## Pending next steps (in order)

1. **Minh: add `VIMEO_COOKIES` secret** — repo Settings → Secrets → Actions → New secret named `VIMEO_COOKIES`, value = vimeo-only Netscape cookie export. Re-export procedure: CLAUDE.md §6 ("Refresh the VIMEO_COOKIES secret"). The 2026-07-22 export at `/tmp/vimeo-cookies.txt` is likely gone (tmp clears on reboot) — re-extract from **Edge** (his browser).
2. **Test dispatch**: Actions → "Phaminh SEO Automation" → Run workflow → URL blank → check "Also run YouTube sync". Success = sync step runs several MINUTES (download+upload) and "Emma & Hadar" (Vimeo 1162069383) appears on the channel. Verify via the YouTube API (Runbook below).
3. **Confirm Google OAuth app is published to "In production"** — https://console.cloud.google.com/apis/credentials/consent. If still "Testing", refresh tokens die every 7 days (would fail ~2026-07-29 with `invalid_grant`). Minh was told; completion unconfirmed.
4. **Soft spot**: YouTube video "Linda & Linh" (DymoL-l7qyQ) has no linked Vimeo counterpart — if its Vimeo twin exists (private or renamed), add it to `scripts/youtube-registry.json` to guarantee no duplicate upload.
5. Sync cron runs on the 1st/6th/11th/16th/21st/26th/31st at 14:00 UTC, one video per run (~93 videos eligible → full catalog takes ~15 months; discuss increasing cadence/limit once a test upload succeeds).

## Runbook

**Check recent workflow runs (unauthenticated, 60 req/hr — poll gently, ≥60s apart):**
```bash
curl -s "https://api.github.com/repos/iphaminh/iphaminh/actions/runs?per_page=5" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{(JSON.parse(d).workflow_runs||[]).forEach(w=>console.log(w.id,'|',w.name,'|',w.event,'|',w.created_at,'|',w.status,w.conclusion||''))})"
```
Step-level detail: same base URL + `/actions/runs/<id>/jobs`. Full logs need auth — ask Minh for a screenshot of the red step instead. No `gh` CLI on the MacBook.

**Verify what's on the YouTube channel (read-only, uses .env credentials):**
```bash
cd scripts && node -e "require('dotenv').config({path:'../.env'});(async()=>{const t=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.YOUTUBE_CLIENT_ID,client_secret:process.env.YOUTUBE_CLIENT_SECRET,refresh_token:process.env.YOUTUBE_REFRESH_TOKEN,grant_type:'refresh_token'})}).then(r=>r.json());const c=await fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&mine=true',{headers:{Authorization:'Bearer '+t.access_token}}).then(r=>r.json());console.log('videos:',c.items[0].statistics.videoCount);const u=c.items[0].contentDetails.relatedPlaylists.uploads;const i=await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId='+u+'&maxResults=5',{headers:{Authorization:'Bearer '+t.access_token}}).then(r=>r.json());i.items.forEach(x=>console.log(x.snippet.publishedAt.slice(0,10),'|',x.snippet.title.slice(0,60)))})();"
```

**Fix `invalid_grant` (YouTube token dead):** `node scripts/youtube-auth.js` locally (needs `YOUTUBE_CLIENT_ID`/`SECRET` in `.env`) → browser consent → new token written to `.env` → Minh updates `YOUTUBE_REFRESH_TOKEN` GitHub secret. Copy value to his clipboard: `grep '^YOUTUBE_REFRESH_TOKEN=' .env | cut -d= -f2- | tr -d '\n' | pbcopy`.

**Fix expired Vimeo cookies:** procedure in CLAUDE.md §6. Minh's browser is **Microsoft Edge**. Filter to vimeo-only lines before it goes anywhere near a secret; delete the full jar.

**Machine quirks (this MacBook):**
- `.env` now has: both Vimeo token names, `VIMEO_USER_ID`, `YOUTUBE_CLIENT_ID/SECRET/REFRESH_TOKEN`. `VIMEO_ACCESS_TOKEN` = the full-scope token ending `b3b0` (same as GitHub secret). Still missing: `ANTHROPIC_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`.
- yt-dlp: installed via `pip3 --user --pre` at `~/Library/Python/3.9/bin` (add to PATH).
- No `gh` CLI, no python yaml. YAML checks: `npx --yes js-yaml <file>`.
- Watch out: `.env` had no trailing newline once — appends glued to the last line. Check with awk before/after edits.

**Key gotchas:** CLAUDE.md §8 table (UTF-8 setEncoding, require.main guards, no `[skip ci]` on build-input data, GH_PAT vs GITHUB_TOKEN). Never put the literal skip-ci token inside a commit message body — it skips the deploy (yes, it happened).
