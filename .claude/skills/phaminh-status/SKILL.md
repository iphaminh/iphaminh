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
- Sync schedule: **Sun/Tue/Thu/Sat 23:00 UTC** = 4pm Pacific / 6pm Central, one video per run (raised from 2x/week on 2026-08-08 — clears the ~90-video backlog in ~5 months instead of ~11).
- **Failure alerting is live** (`alert-on-failure` job): any failed job opens or pings a single assigned GitHub issue labelled `automation-failure`, re-pinging at most once per ~11h. Uses `GH_PAT` because the default `GITHUB_TOKEN` is read-only here.
- Vimeo Plus has NO API file access (`download`/`files`/`play` empty even with `video_files` scope) — cookies are the only download path unless Minh upgrades to a Pro-tier plan.

## What broke 2026-07-29 → 2026-08-08 (read this before debugging `invalid_grant` again)

The refresh token minted 2026-07-22 died with `invalid_grant` ("Token has been expired or revoked") exactly 7 days later. Last good upload Jul 28; the Aug 2 and Aug 4 scheduled runs both failed. Nobody noticed for 10 days.

The trap: by the time we investigated, the OAuth consent screen already read **"In production"** — which made the 7-day Testing expiry look ruled out. It wasn't. **Publishing the app does not rescue tokens already issued under Testing mode.** A refresh token keeps whatever expiry rules were in force at the moment it was minted. The July 22 token was born in Testing and was doomed from birth regardless of what happened to the app afterward.

**Rule going forward:** if a token dies at ~7 days, re-mint first, check publish status second. Re-minting is cheap and is the fix in both cases.

## Watchpoints (check when resuming)

1. **New token minted 2026-08-08, with the app already "In production"** — it should now be permanent. If it dies around **2026-08-15**, the 7-day theory is wrong and something else is revoking it: check https://myaccount.google.com/permissions for a revoked grant, and whether the Google account password changed.
2. **Verify the alert actually fires.** `alert-on-failure` was added 2026-08-08 and has not yet fired for real. First red run should open an assigned issue — if it doesn't, check that `GH_PAT` still has `repo` scope (issue creation needs it; the default `GITHUB_TOKEN` is read-only here).
3. **Changing the sync cron means changing TWO strings.** The `on.schedule` cron and the `youtube-sync` job's `github.event.schedule == '...'` guard must stay byte-identical — GitHub compares them literally, and a mismatch silently stops the sync with no error. Validator:
   ```bash
   python3 -c "
   import yaml,re;s=open('.github/workflows/seo-automation.yml').read();w=yaml.safe_load(s)
   c=[x['cron'] for x in (w.get('on') or w[True])['schedule']];g=re.findall(r\"github.event.schedule == '([^']+)'\",s)
   print('crons',c);print('guards',g);print('OK' if set(g)<=set(c) else 'MISMATCH')"
   ```
4. **Vimeo cookies expire eventually** (months). Failure message says so explicitly; refresh procedure in CLAUDE.md §6 (base64 → `VIMEO_COOKIES_B64`).
5. **Soft spot**: YouTube video "Linda & Linh" (DymoL-l7qyQ) has no linked Vimeo counterpart — if its Vimeo twin exists (private or renamed), add it to `scripts/youtube-registry.json` to guarantee no duplicate upload.
6. Backlog now ~5 months at 4/week. To go faster, add cron days rather than raising `--limit` — one video per slot beats several at one timestamp, and quota is not the binding constraint (1,600 units/upload of 10,000/day).
7. Registry commits from sync runs use `[skip ci]` — correct (nothing in the build reads it). Note a successful upload often leaves the registry *unchanged*, because the link is written as a Vimeo tag instead. **Absence of a registry commit is NOT evidence that no upload happened** — check the run logs.

## Pending / next up

- ~~MERGE THE SEO BRANCH~~ **DONE — merged & deployed 2026-08-10** (SEO overhaul at `d09a2cc`, then design pass at `a95cc53`: clean hero, gold intro band, animated award strip, Brindare Napa venue guide). Minh confirmed the live site visually. Still to verify by hand: /bogus-url returns 404, and the two new location pages render (screenshots confirmed homepage only).
- **Search Console validation NOT yet clicked** — Minh needs to press "Validate Fix" on the four Page-indexing error buckets and resubmit the sitemap. Nag gently.
- **Pricing page shipped 2026-08-10 evening** (`ed7b7c8`): editorial cards + FAQ redesign, and purged stale facts — the FAQ claimed "based in Arkansas and Georgia" and 8-12wk delivery vs the contract's 6-8wk (contract wins; fixed across all 14 location FAQs + llms.txt; booking guidance now 1-2yr/20-25 weddings). **OPEN: the tax FAQ still cites Arkansas/Georgia law — waiting on Minh's accountant; do not guess CA tax policy.**
- **GBP setup in progress** — Minh reached service-areas step (warned off the Manhattan placeholder and off using his brother-in-law's address at 150 Nut Tree Pkwy; correct setup = service-area business, real home address hidden). Follow up on verification status.
- **Design queue COMPLETE (2026-08-10)**: homepage intro band, press bar ("Recognized By" + height-aligned badges), pricing editorial, and /cine gallery plates (serif captions, location lines, first-party vimeocdn thumbnails) all shipped via the show-then-ship loop — live through `5f4554f`. Playwright screenshots work in the cloud sandbox: serve build/ w/ python http.server + playwright-core + /opt/pw-browsers/chromium. Gold system tokens: eyebrow #a08339, hairline #c9ab63, ink #23211d, body #4a463f.
- **GBP description drafted and delivered** (723 chars) — Minh was pasting it; profile was at 83%, remaining: photos, services, hours.
- **Watch the first cron enrichment worked**: 5645d17 auto-committed vimeo-videos.json with releaseTime/duration — film-page VideoObjects now carry real dates. Verify a /cine/:slug page's JSON-LD shows uploadDate after this deploy.
- **Venue-relations pattern established** with the Brindare guide (no pricing, no packet internals, send couples to the venue's events team): reuse it for Suisun Valley Inn, Vezér, Park Winters, etc. Minh has venue-coordinator conversations going (talked to "Sarah" — note: Brindare's packet lists Amy Ahnfeldt as sales manager; do not put staff names on our pages).
- Original archived note on the merged work follows below.

### (archived) MERGE THE SEO BRANCH. The full SEO/GEO/AEO overhaul (2026-08-08/09, five commits `86365fc..dde94f3` on `claude/website-work-history-ynl3hj`) is built, validated (55 pages, JSON-LD parse clean, sitemap valid), and pushed — but sits UNMERGED. Nothing deploys until it merges to main. It contains: the .htaccess rewrite fixing the trailing-slash/canonical contradiction behind the 21-unindexed-pages problem (12x alternate-canonical, 5x redirect, 3x redirect-error), a real prerendered 404, routeMeta/businessSchema shared CJS modules, Vacaville entity schema, llms.txt facts, vacaville-suisun-valley + sacramento location pages, Mountain View claim rewrites, VideoObject fixes + video sitemap, filmsForGroup Arkansas-fill fix, full static blog bodies in #root, homepage H1, and tuned sync prompts (the " | " marker is load-bearing — see the prompt comments).
- **After the merge deploys:** (1) curl-verify: `curl -sI https://www.phaminh.com/cine` → 200 not 301; `curl -sI https://www.phaminh.com/cine/` → 301 to /cine; `curl -sIL http://phaminh.com/pricing` → exactly one 301; `curl -sI https://www.phaminh.com/bogus` → 404. If the site 500s, delete the `DirectorySlash Off` line (comment in .htaccess explains). (2) Search Console: validate the four error buckets + resubmit the sitemap. (3) The first 6-hour cron enriches vimeo-videos.json with releaseTime/duration → next deploy fills VideoObject dates automatically.
- **Minh's offline checklist** (from the 12-agent research run; full plan JSON archived in the session scratchpad, top items): create Google Business Profile as a service-area business from Vacaville (hide address); fix The Knot ("conway-ar") and WeddingWire ("Alexander, AR") profile cities to Vacaville CA — 73% of AI wedding answers route through that duopoly; start a review engine (Google first, then Knot/WW — ask at film delivery); claim Bing Places + Yelp + Apple Business Connect (ChatGPT's local stack is Bing/Yelp); update Instagram bio + YouTube channel About/country to Vacaville; visit the Suisun Valley venues' coordinators (preferred-vendor lists are the durable moat).
- **Perf + honesty pass shipped 2026-08-10 late (`4fc65201`)**: image library 253MB → 25MB (146 WebP conversions via scripts/optimize-images.js — re-runnable for future uploads), deploy.yml now has the alert-on-failure job, badge files/alts renamed to their REAL awards (the "atlanta" file was the Knot Best of Weddings badge). Site build is 32MB total.
- **Minh is MOVING to Vacaville next week** — GBP verification (901 Sara Ct Apt 25, Vacaville 95687, hidden) deliberately waits until he's there. He also found an AGED GBP from the Mountain View era — check for duplicate profiles at business.google.com (keep the old one, delete any new one); service-area surgery list was provided (counties trick).
- **Blog images shipped 2026-08-10 (`31218864`)**: all 13 posts use REAL film frames (i.vimeocdn URLs from vimeo-videos.json, region-matched) rendered on index cards + post heroes with "From a real wedding film" captions; onError falls back to the cover webp. Decision on record: NO AI-generated wedding imagery on this site — brand-trust risk for a real cinematographer, and Minh's Higgsfield account has 0 credits anyway. Swap in Minh's own stills whenever he provides them.
- **Content follow-ups:** curate California films into films.js when Minh identifies them (search vimeo-videos.json for Mountain View/CA titles) with venue/city/locationSlug fields — the schema + parser already accept them; retrofit 2-3 internal links into the 8 older blog posts (skipped: template-literal editing risk).

## Standing automation outside the repo

- **Weekly Monday Health Check Routine** (`trig_01Qs14EogC1aACo2khhL7Vuj`, created 2026-08-10): fires Mondays 15:00 UTC (8am PT) into a FRESH session; read-only report on Actions health, YouTube sync slots, and open automation-failure issues; push+email notification to Minh. Manage via list_triggers/update_trigger, or claude.ai Routines UI. It reads THIS file first — keep Current state honest.
- **Connectors Minh has linked** (claude.ai level): Gmail, Google Drive, Google Calendar, Calendly (account "Phaminh Cinematography", scheduling URL https://calendly.com/minhmeoquay-sace, TZ America/Los_Angeles, created 2026-08-10 — NO event types yet), Notion, Adobe, Stripe (account state unverified), GitHub. Next session candidates: create a "Wedding Consultation" Calendly event type + add a Book-a-Call CTA to the site; Gmail review-request drafts to past couples.

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
