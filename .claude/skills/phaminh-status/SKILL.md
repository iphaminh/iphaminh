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

## Current state (updated 2026-08-08)

**Everything is working end-to-end. 🎉**
- Vimeo SEO automation (6-hour cron): healthy, green on every run.
- **YouTube sync: restored 2026-08-08** after a 10-day outage (see below). Verified upload: "Northwest Arkansas Wedding Film | Darby + Tyler 2026" → https://www.youtube.com/watch?v=kOOESDhfVXU — thumbnail set, Vimeo tagged `youtube:kOOESDhfVXU`, Notion logged, `1 uploaded, 0 failed`.
- Sync schedule: **Sundays + Tuesdays 23:00 UTC** (audience-timed), one video per run.
- Vimeo Plus has NO API file access (`download`/`files`/`play` empty even with `video_files` scope) — cookies are the only download path unless Minh upgrades to a Pro-tier plan.

## What broke 2026-07-29 → 2026-08-08 (read this before debugging `invalid_grant` again)

The refresh token minted 2026-07-22 died with `invalid_grant` ("Token has been expired or revoked") exactly 7 days later. Last good upload Jul 28; the Aug 2 and Aug 4 scheduled runs both failed. Nobody noticed for 10 days.

The trap: by the time we investigated, the OAuth consent screen already read **"In production"** — which made the 7-day Testing expiry look ruled out. It wasn't. **Publishing the app does not rescue tokens already issued under Testing mode.** A refresh token keeps whatever expiry rules were in force at the moment it was minted. The July 22 token was born in Testing and was doomed from birth regardless of what happened to the app afterward.

**Rule going forward:** if a token dies at ~7 days, re-mint first, check publish status second. Re-minting is cheap and is the fix in both cases.

## Watchpoints (check when resuming)

1. **New token minted 2026-08-08, with the app already "In production"** — it should now be permanent. If it dies around **2026-08-15**, the 7-day theory is wrong and something else is revoking it: check https://myaccount.google.com/permissions for a revoked grant, and whether the Google account password changed.
2. **No failure alerting** — this outage ran 10 days in silence because a red Action notifies nobody. Minh was offered a workflow-level failure notification and hasn't decided yet. Worth revisiting; it's the difference between a 2-day and a 10-day outage.
3. **Vimeo cookies expire eventually** (months). Failure message says so explicitly; refresh procedure in CLAUDE.md §6 (base64 → `VIMEO_COOKIES_B64`).
4. **Soft spot**: YouTube video "Linda & Linh" (DymoL-l7qyQ) has no linked Vimeo counterpart — if its Vimeo twin exists (private or renamed), add it to `scripts/youtube-registry.json` to guarantee no duplicate upload.
5. At 2/week, the ~90-video backlog takes ~11 months. If Minh wants faster, raise `--limit` (max 5/run for quota) or add cron days.
6. Registry commits from sync runs use `[skip ci]` — correct (nothing in the build reads it). Note a successful upload often leaves the registry *unchanged*, because the link is written as a Vimeo tag instead. **Absence of a registry commit is NOT evidence that no upload happened** — check the run logs.

## Pending / next up

- **Search Console indexing cleanup (not started).** Minh shared Page-indexing exports on 2026-08-08. Impressions are climbing well — ~3/day in June → 28-41/day in late July/early August. Critical issues outstanding: 12 "Alternate page with proper canonical tag", 5 "Page with redirect", 3 "Redirect error", 1 "Crawled - currently not indexed". Indexed 17 / not-indexed 21. The 3 redirect errors are the ones worth chasing first. He asked to park this until the YouTube fix was done — it now is.

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

**Fix expired Vimeo cookies:** procedure in CLAUDE.md §6 — export from **Microsoft Edge** (Minh's browser), filter to vimeo-only lines, **base64-encode**, paste into the `VIMEO_COOKIES_B64` secret. Never ship the unfiltered jar; delete it after.

**Machine quirks (this MacBook):**
- **Repo path: `~/Documents/GitHub/iphaminh`.** Give Minh `cd ~/Documents/GitHub/iphaminh && <command>` as one line — he opens Terminal in his home folder, so a bare `node scripts/...` fails with MODULE_NOT_FOUND.
- **Never tell him to run `find ~`** — it crawls iCloud/Photos and hangs for minutes (he Ctrl+C'd it twice). Use the known path above, or `mdfind -name <file>`.
- `.env` now has: both Vimeo token names, `VIMEO_USER_ID`, `YOUTUBE_CLIENT_ID/SECRET/REFRESH_TOKEN`. `VIMEO_ACCESS_TOKEN` = the full-scope token ending `b3b0` (same as GitHub secret). Still missing: `ANTHROPIC_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`.
- Console navigation is where he gets lost — hand him direct URLs, not click-paths. Secrets: https://github.com/iphaminh/iphaminh/settings/secrets/actions · Actions: https://github.com/iphaminh/iphaminh/actions/workflows/seo-automation.yml · OAuth audience: https://console.cloud.google.com/auth/audience
- yt-dlp: installed via `pip3 --user --pre` at `~/Library/Python/3.9/bin` (add to PATH).
- No `gh` CLI, no python yaml. YAML checks: `npx --yes js-yaml <file>`.
- Watch out: `.env` had no trailing newline once — appends glued to the last line. Check with awk before/after edits.

**Key gotchas:** CLAUDE.md §8 table (UTF-8 setEncoding, require.main guards, no `[skip ci]` on build-input data, GH_PAT vs GITHUB_TOKEN). Never put the literal skip-ci token inside a commit message body — it skips the deploy (yes, it happened).
