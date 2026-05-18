#!/usr/bin/env node
// Phaminh SEO Automation
// Usage: VIMEO_URL=https://vimeo.com/123456789 node seo-automation.js

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const VIMEO_URL = process.env.VIMEO_URL;
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!VIMEO_URL || !VIMEO_ACCESS_TOKEN || !ANTHROPIC_API_KEY) {
  console.error('Missing required env vars: VIMEO_URL, VIMEO_ACCESS_TOKEN, ANTHROPIC_API_KEY');
  process.exit(1);
}

function extractVideoId(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!match) throw new Error(`Cannot extract video ID from: ${url}`);
  return match[1];
}

async function vimeoGet(endpoint, token) {
  const res = await fetch(`https://api.vimeo.com${endpoint}`, {
    headers: {
      Authorization: `bearer ${token}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vimeo GET ${endpoint}: ${res.status} ${body}`);
  }
  return res.json();
}

async function vimeoPatch(endpoint, token, body) {
  const res = await fetch(`https://api.vimeo.com${endpoint}`, {
    method: 'PATCH',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vimeo PATCH ${endpoint}: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  const videoId = extractVideoId(VIMEO_URL);
  console.log(`Processing Vimeo video ID: ${videoId}`);

  // 1. Fetch video metadata
  console.log('Fetching video metadata from Vimeo...');
  const video = await vimeoGet(`/videos/${videoId}`, VIMEO_ACCESS_TOKEN);
  const videoTitle = video.name || '';
  const videoDescription = video.description || '';
  const videoDuration = video.duration || 0;
  const videoTags = (video.tags || []).map(t => t.name).join(', ');
  const minutes = Math.floor(videoDuration / 60);
  const seconds = videoDuration % 60;
  console.log(`  Title: "${videoTitle}" | Duration: ${minutes}m ${seconds}s`);

  // 2. Read existing films.js
  const filmsPath = path.join(__dirname, '..', 'src', 'data', 'films.js');
  const filmsContent = fs.readFileSync(filmsPath, 'utf8');

  const existingSlugs = [...filmsContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const existingVimeoIds = [...filmsContent.matchAll(/vimeoId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

  if (existingVimeoIds.includes(videoId)) {
    console.log(`Video ${videoId} already exists in films.js — skipping.`);
    process.exit(0);
  }

  // 3. Generate SEO content with Claude
  console.log('Generating SEO content with Claude Opus...');
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const prompt = `You are an SEO expert for Phaminh Cinematography, a wedding videography and photography business owned by Minh Pham. He serves the San Francisco Bay Area (CA) and Northwest/Central Arkansas primarily, but also does destination weddings worldwide.

A new wedding film was just uploaded to Vimeo:
- Current Title: "${videoTitle}"
- Current Description: "${videoDescription}"
- Duration: ${minutes} minutes ${seconds} seconds
- Tags: ${videoTags || 'none'}
- Vimeo ID: ${videoId}

Generate SEO-optimized content for this film. Return ONLY a valid JSON object — no explanation, no markdown, just the raw JSON:

{
  "title": "Film card title (50-70 chars). Include location + 'Wedding Film' + 'Phaminh Cinematography'. Example: 'Bentonville Winery Wedding Film | Phaminh Cinematography'",
  "slug": "url-slug (lowercase, hyphens, 4-7 words, unique). Example: 'bentonville-winery-wedding-film'",
  "location": "One of: Arkansas, Northwest Arkansas, Bay Area, Bay Area CA, San Francisco, Napa, Sonoma, Destination — pick based on clues in title/description, default to Arkansas",
  "description": "2-3 sentence film card for the website. Mention location, cinematic style, emotional moments. 60-100 words.",
  "vimeoTitle": "Vimeo page title (60-80 chars). City/region + wedding film + Phaminh Cinematography. Example: 'Northwest Arkansas Wedding Film — Bentonville Winery | Phaminh Cinematography'",
  "vimeoDescription": "Full Vimeo description (350-500 words). Tell the story of the film with rich detail. Naturally embed: wedding videographer [city], cinematic wedding film, wedding video [region], phaminh.com. End with: 'Visit phaminh.com to view more films and book your date.' Plain text only, no markdown.",
  "hashtags": ["wedding", "weddingfilm", "weddingvideographer", "cinematicwedding", "...up to 12 relevant hashtags total"]
}

Avoid these existing slugs: ${existingSlugs.join(', ')}

Focus keywords on Arkansas and Bay Area CA for maximum SEO impact on phaminh.com's target markets.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('Claude returned no text block');

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in Claude response:\n${textBlock.text}`);

  const seo = JSON.parse(jsonMatch[0]);
  console.log(`  Generated: "${seo.title}"`);
  console.log(`  Slug: ${seo.slug} | Location: ${seo.location}`);

  // 4. Update Vimeo video
  console.log('Updating Vimeo title and description...');
  await vimeoPatch(`/videos/${videoId}`, VIMEO_ACCESS_TOKEN, {
    name: seo.vimeoTitle,
    description: seo.vimeoDescription,
  });
  console.log('  Vimeo updated.');

  // 5. Prepend new film entry to films.js
  const escapedTitle = seo.title.replace(/'/g, "\\'");
  const escapedDescription = seo.description.replace(/'/g, "\\'");
  const escapedLocation = seo.location.replace(/'/g, "\\'");

  const newEntry = `  {
    slug: '${seo.slug}',
    title: '${escapedTitle}',
    description: '${escapedDescription}',
    location: '${escapedLocation}',
    vimeoId: '${videoId}',
  },`;

  const updatedFilms = filmsContent.replace(
    /^(export const films = \[)\n/m,
    `$1\n${newEntry}\n`
  );
  fs.writeFileSync(filmsPath, updatedFilms, 'utf8');
  console.log('  films.js updated.');

  // 6. Add new URL to sitemap.xml
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  const newUrlEntry = `  <url>
    <loc>https://www.phaminh.com/cine/${seo.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  const updatedSitemap = sitemapContent.replace('</urlset>', `${newUrlEntry}\n</urlset>`);
  fs.writeFileSync(sitemapPath, updatedSitemap, 'utf8');
  console.log('  sitemap.xml updated.');

  // 7. Write outputs for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `film_title=${seo.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `film_slug=${seo.slug}\n`);
  }

  console.log(`\nDone! New film: "${seo.title}" -> /cine/${seo.slug}`);
}

main().catch(err => {
  console.error('\nAutomation failed:', err.message);
  process.exit(1);
});
