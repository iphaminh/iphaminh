# Phaminh Vietnamese Social Content Automation

Creates one coordinated 3-photo carousel each day with original Vietnamese motivational quotes, then publishes it to Instagram and TikTok Photo Mode.

## Why one carousel per day

Three separate daily posts can fatigue followers. One 3-slide story encourages swipes, saves, shares, and comments while giving each day one clear theme. Review performance after 30 days before changing frequency.

## Local commands

```bash
cd social-automation
npm install
npm run check
npm run generate
npm run publish
```

Generation is idempotent by date. Use `npm run generate -- --force` only to intentionally replace today's content. Publishing is disabled until `PUBLISH_ENABLED=true`, and publication IDs are recorded to prevent duplicate posts.

## Required GitHub secrets

- `OPENAI_API_KEY`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`
- `TIKTOK_ACCESS_TOKEN`

The social accounts also require platform-side setup:

- Instagram: Professional account, Meta developer app, Instagram content-publishing permission, and a valid user token.
- TikTok: developer app with Content Posting API, approved `video.publish` scope, account authorization, verified `phaminh.com` URL prefix/domain, and an audit before public direct posts.

Set repository variable `SOCIAL_PUBLISH_ENABLED=true` only after both connections work. Until then, the workflow generates and deploys content without posting.

The OpenAI Platform project must have API billing/credits enabled. A ChatGPT subscription and OpenAI API usage are billed separately.

## Schedule

The GitHub Action runs daily at 14:00 UTC (approximately 6–7 AM Pacific depending on daylight saving time). It generates the carousel, commits it to `public/social-content`, waits for the website deployment, then publishes when enabled. A manual workflow run can generate only, publish existing content, or do both.
