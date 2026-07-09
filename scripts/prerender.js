// scripts/prerender.js
// Post-build prerendering: writes a real static HTML file for every route
// so Google + social crawlers see proper title, description, og tags, and content
// instead of the empty React SPA shell.
//
// Runs after `react-scripts build` as part of `npm run build`.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const FILMS_PATH = path.join(ROOT, 'src', 'data', 'films.js');
const BLOG_PATH = path.join(ROOT, 'src', 'data', 'blogPosts.js');
const LOCATIONS_PATH = path.join(ROOT, 'src', 'data', 'locations.json');

const SITE_URL = 'https://www.phaminh.com';
const SITE_NAME = 'Phaminh Cinematography';
const DEFAULT_IMAGE = `${SITE_URL}/assets/seo/phaminh-wedding-cover.jpg`;

// ──────────────────────────────────────────────────────────────────────────────
// Data extraction — parse films.js and blogPosts.js without needing to evaluate
// ──────────────────────────────────────────────────────────────────────────────

function parseFilms() {
  const content = fs.readFileSync(FILMS_PATH, 'utf8');
  const films = [];
  // Each film: { slug: '...', title: '...', description: '...', location: '...', vimeoId: '...' }
  // Descriptions may contain escaped single quotes
  const re = /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'((?:[^'\\]|\\.)*)',\s*location:\s*'([^']+)',\s*vimeoId:\s*'([^']+)',?\s*\}/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    films.push({
      slug: m[1],
      title: m[2],
      description: m[3].replace(/\\'/g, "'"),
      location: m[4],
      vimeoId: m[5],
    });
  }
  return films;
}

function parseBlogPosts() {
  const content = fs.readFileSync(BLOG_PATH, 'utf8');
  const posts = [];
  // Match each post header (just the metadata fields we need)
  const re = /\{\s*slug:\s*'([^']+)',\s*title:\s*'((?:[^'\\]|\\.)*)',\s*description:\s*'((?:[^'\\]|\\.)*)',\s*date:\s*'([^']+)',\s*location:\s*'((?:[^'\\]|\\.)*)',\s*category:\s*'([^']+)',\s*readTime:\s*'([^']+)',\s*image:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    posts.push({
      slug: m[1],
      title: m[2].replace(/\\'/g, "'"),
      description: m[3].replace(/\\'/g, "'"),
      date: m[4],
      location: m[5].replace(/\\'/g, "'"),
      category: m[6],
      readTime: m[7],
      image: m[8],
    });
  }
  return posts;
}

// ──────────────────────────────────────────────────────────────────────────────
// HTML helpers
// ──────────────────────────────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteImage(img) {
  if (!img) return DEFAULT_IMAGE;
  if (img.startsWith('http')) return img;
  return `${SITE_URL}${img}`;
}

// Renders a complete <head> block for a page
function buildHead({ title, description, canonical, ogImage, ogType, jsonLd }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safeImage = escapeHtml(ogImage);
  const safeType = escapeHtml(ogType || 'website');

  const ldJson = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';

  return `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${safeCanonical}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:type" content="${safeType}" />
    <meta property="og:url" content="${safeCanonical}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    ${ldJson}
  `.trim();
}

// Renders a <noscript> body block — what crawlers without JS see.
// This is real HTML, real text content, real links for indexing.
function buildNoscript(html) {
  return `<noscript><div style="max-width:900px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.6;color:#222">${html}</div></noscript>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Page generator — takes the build/index.html template and rewrites head + noscript
// ──────────────────────────────────────────────────────────────────────────────

function loadTemplate() {
  return fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
}

function rewritePage(template, { headBlock, noscriptHtml }) {
  let html = template;

  // Strip the existing tags that we're replacing
  html = html
    .replace(/<title>[^<]*<\/title>/, '')
    .replace(/<meta name="description"[^>]*\/?>/, '')
    .replace(/<link rel="canonical"[^>]*\/?>/, '')
    .replace(/<meta property="og:site_name"[^>]*\/?>/, '')
    .replace(/<meta property="og:title"[^>]*\/?>/, '')
    .replace(/<meta property="og:description"[^>]*\/?>/, '')
    .replace(/<meta property="og:type"[^>]*\/?>/, '')
    .replace(/<meta property="og:url"[^>]*\/?>/, '')
    .replace(/<meta property="og:image"[^>]*\/?>/, '')
    .replace(/<meta property="og:image:alt"[^>]*\/?>/, '')
    .replace(/<meta name="twitter:card"[^>]*\/?>/, '')
    .replace(/<meta name="twitter:title"[^>]*\/?>/, '')
    .replace(/<meta name="twitter:description"[^>]*\/?>/, '')
    .replace(/<meta name="twitter:image"[^>]*\/?>/, '');

  // Insert our head block right before </head>
  html = html.replace('</head>', `${headBlock}\n</head>`);

  // Replace the entire noscript block (the build keeps the public/index.html one)
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, noscriptHtml);

  return html;
}

function writePage(routePath, html) {
  const cleanPath = routePath === '/' ? '' : routePath.replace(/^\//, '');
  const dir = path.join(BUILD_DIR, cleanPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`  ✓ /${cleanPath || ''} → ${path.relative(ROOT, path.join(dir, 'index.html'))}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────────

function generateAll() {
  const template = loadTemplate();
  const films = parseFilms();
  const posts = parseBlogPosts();
  const locations = JSON.parse(fs.readFileSync(LOCATIONS_PATH, 'utf8'));

  console.log(`\nPrerendering: ${films.length} films, ${posts.length} blog posts, ${locations.length} location pages, plus static routes\n`);

  // ─── Static routes ─────────────────────────────────────────────────────────
  const staticRoutes = [
    {
      path: '/',
      title: 'Phaminh Cinematography | Bay Area & Arkansas Wedding Videographer',
      description: 'Minh Pham creates cinematic wedding films and photography for couples in the San Francisco Bay Area, Northern California, Northwest Arkansas, and destination weddings worldwide.',
      noscript: `
        <h1>Phaminh Cinematography — Bay Area & Arkansas Wedding Videographer</h1>
        <p>Minh Pham creates cinematic wedding films and photography for couples in San Francisco, Oakland, San Jose, Napa, Sonoma, Fayetteville AR, Bentonville AR, Rogers AR, Little Rock AR, and destination weddings worldwide.</p>
        <h2>Wedding Films</h2>
        <p>Browse our <a href="/cine">complete wedding film portfolio</a> featuring real couples and emotional, story-driven cinematic films.</p>
        <h2>Photography</h2>
        <p>See our <a href="/foto">wedding, engagement, and portrait photography</a>.</p>
        <h2>Pricing</h2>
        <p>Wedding videography packages start at $2,700. <a href="/pricing">View all packages and pricing</a>.</p>
        <h2>Contact</h2>
        <p>Ready to book? <a href="/contact">Get in touch with Minh</a> — phaminh@outlook.com</p>
      `,
    },
    {
      path: '/cine',
      title: 'Cinematic Wedding Films | San Francisco Bay Area & NW Arkansas Videographer | Phaminh',
      description: 'Watch wedding films by Minh Pham — serving San Francisco, Oakland, Napa, Fayetteville AR, Bentonville AR, and Rogers AR. Emotional, story-driven films for real couples.',
      noscript: `
        <h1>Wedding Films by Phaminh Cinematography</h1>
        <p>Cinematic wedding films for couples across the San Francisco Bay Area, Northern California, and Northwest Arkansas.</p>
        <h2>Recent Films</h2>
        <ul>
          ${films.map(f => `<li><a href="/cine/${f.slug}">${escapeHtml(f.title)} — ${escapeHtml(f.location)} wedding film</a></li>`).join('')}
        </ul>
        <p><a href="/contact">Book your wedding film</a> or <a href="/pricing">view pricing</a>.</p>
      `,
    },
    {
      path: '/foto',
      title: 'Wedding Photography | Bay Area & Arkansas Photographer | Phaminh',
      description: 'Candid, timeless wedding photography by Minh Pham. Serving San Francisco Bay Area, Northern California, and Northwest Arkansas. Wedding, engagement, and portrait sessions.',
      noscript: `
        <h1>Wedding Photography by Phaminh Cinematography</h1>
        <p>Candid, timeless wedding and engagement photography by Minh Pham.</p>
        <ul>
          <li><a href="/foto/wedding">Wedding photography</a></li>
          <li><a href="/foto/engagement">Engagement photography</a></li>
          <li><a href="/foto/portrait">Portrait photography</a></li>
        </ul>
      `,
    },
    {
      path: '/foto/wedding',
      title: 'Wedding Photography Portfolio | Bay Area & Arkansas | Phaminh',
      description: 'Wedding photography portfolio by Minh Pham — real couples across San Francisco, Bay Area, Napa, Sonoma, and Northwest Arkansas.',
      noscript: `<h1>Wedding Photography Portfolio</h1><p>Real weddings photographed by Phaminh Cinematography across California and Arkansas.</p>`,
    },
    {
      path: '/foto/engagement',
      title: 'Engagement Photography | Bay Area & Arkansas | Phaminh',
      description: 'Engagement photography by Minh Pham — relaxed, candid couples sessions for Bay Area and Northwest Arkansas weddings.',
      noscript: `<h1>Engagement Photography</h1><p>Relaxed, story-driven engagement sessions for Bay Area and Arkansas couples.</p>`,
    },
    {
      path: '/foto/portrait',
      title: 'Portrait Photography | Bay Area & Arkansas | Phaminh',
      description: 'Portrait photography by Minh Pham — natural, story-driven portrait sessions in the Bay Area and Northwest Arkansas.',
      noscript: `<h1>Portrait Photography</h1><p>Natural light portrait sessions by Phaminh Cinematography.</p>`,
    },
    {
      path: '/pricing',
      title: 'Wedding Videography & Photography Pricing | Phaminh Cinematography',
      description: 'Wedding videography packages start at $2,700. Browse complete pricing for wedding films, elopement films, and photography in the Bay Area and Northwest Arkansas.',
      noscript: `
        <h1>Pricing — Phaminh Cinematography</h1>
        <h2>Wedding Videography</h2>
        <p>Packages start at $2,700 for full-day cinematic wedding coverage in the Bay Area and Arkansas.</p>
        <h2>Elopement Films</h2>
        <p>Intimate elopement films starting at $2,500.</p>
        <h2>Engagement Sessions</h2>
        <p>Engagement photography and short films available — <a href="/contact">contact for pricing</a>.</p>
      `,
    },
    {
      path: '/contact',
      title: 'Contact Phaminh Cinematography | Book Your Wedding Film',
      description: 'Get in touch with Minh Pham to book your wedding film. Serving the San Francisco Bay Area, Northern California, Northwest Arkansas, and destination weddings.',
      noscript: `
        <h1>Contact Phaminh Cinematography</h1>
        <p>Ready to book your wedding film? Reach out to Minh Pham.</p>
        <ul>
          <li>Email: phaminh@outlook.com</li>
          <li>Phone: +1 (870) 270-8837</li>
          <li>Instagram: <a href="https://www.instagram.com/phaminh/">@phaminh</a></li>
        </ul>
      `,
    },
    {
      path: '/testimonials',
      title: 'Client Reviews | Phaminh Cinematography',
      description: 'Read reviews from real couples about their wedding film experience with Phaminh Cinematography.',
      noscript: `<h1>Client Reviews</h1><p>Real reviews from real couples — <a href="/contact">book your own film</a>.</p>`,
    },
    {
      path: '/blog',
      title: 'Wedding Videography Blog | Tips, Pricing & Guides | Phaminh',
      description: 'Practical guides on wedding videography pricing, what to look for in a videographer, venues, and more — written by Minh Pham of Phaminh Cinematography.',
      noscript: `
        <h1>Phaminh Wedding Blog</h1>
        <p>Practical guides for couples planning their wedding film.</p>
        <ul>
          ${posts.map(p => `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.description)}</li>`).join('')}
        </ul>
      `,
    },
  ];

  for (const route of staticRoutes) {
    const headBlock = buildHead({
      title: route.title,
      description: route.description,
      canonical: `${SITE_URL}${route.path === '/' ? '/' : route.path}`,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
    });
    const noscriptHtml = buildNoscript(route.noscript);
    writePage(route.path, rewritePage(template, { headBlock, noscriptHtml }));
  }

  // ─── Film pages ────────────────────────────────────────────────────────────
  for (const film of films) {
    const url = `${SITE_URL}/cine/${film.slug}`;
    const title = `${film.title} | ${film.location} Wedding Film | Phaminh Cinematography`;
    const thumbnail = `https://vumbnail.com/${film.vimeoId}.jpg`;
    const videoEmbedUrl = `https://player.vimeo.com/video/${film.vimeoId}`;
    const videoLandingUrl = `https://vimeo.com/${film.vimeoId}`;

    const videoLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: film.title,
      description: film.description,
      thumbnailUrl: [thumbnail],
      uploadDate: '2024-01-01',
      contentUrl: videoLandingUrl,
      embedUrl: videoEmbedUrl,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/images/logo.png`,
        },
      },
    };

    const headBlock = buildHead({
      title,
      description: film.description,
      canonical: url,
      ogImage: thumbnail,
      ogType: 'video.other',
      jsonLd: videoLd,
    });

    const noscriptHtml = buildNoscript(`
      <p><a href="/cine">← All Wedding Films</a></p>
      <h1>${escapeHtml(film.title)}</h1>
      <p><strong>${escapeHtml(film.location)} wedding film</strong></p>
      <p>${escapeHtml(film.description)}</p>
      <p>Watch this film on <a href="${videoLandingUrl}">Vimeo</a>.</p>
      <p><a href="/contact">Book your wedding film</a> · <a href="/pricing">View pricing</a> · <a href="/foto">Photography portfolio</a></p>
    `);

    writePage(`/cine/${film.slug}`, rewritePage(template, { headBlock, noscriptHtml }));
  }

  // ─── Blog post pages ───────────────────────────────────────────────────────
  for (const post of posts) {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const title = `${post.title} | Phaminh Cinematography`;

    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: absoluteImage(post.image),
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Person',
        name: 'Minh Pham',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/images/logo.png`,
        },
      },
      mainEntityOfPage: url,
    };

    const headBlock = buildHead({
      title,
      description: post.description,
      canonical: url,
      ogImage: absoluteImage(post.image),
      ogType: 'article',
      jsonLd: articleLd,
    });

    const noscriptHtml = buildNoscript(`
      <p><a href="/blog">← All Articles</a></p>
      <h1>${escapeHtml(post.title)}</h1>
      <p><em>${escapeHtml(post.date)} · ${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</em></p>
      <p>${escapeHtml(post.description)}</p>
      <p><a href="/blog/${post.slug}">Read the full article</a></p>
    `);

    writePage(`/blog/${post.slug}`, rewritePage(template, { headBlock, noscriptHtml }));
  }

  // ─── Location landing pages ────────────────────────────────────────────────
  {
    const hubUrl = `${SITE_URL}/wedding-videographer`;
    const hubHead = buildHead({
      title: 'Wedding Videographer Service Areas | Northern California & Arkansas | Phaminh',
      description: 'Cinematic wedding films across Northern California — Napa Valley, Sonoma, San Francisco, Silicon Valley, Carmel, Tahoe — and Arkansas: NWA, Eureka Springs, Hot Springs, Little Rock.',
      canonical: hubUrl,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
    });
    const hubNoscript = buildNoscript(`
      <h1>Wedding Videographer Service Areas — Northern California & Arkansas</h1>
      <p>Minh Pham films weddings across Northern California and Arkansas:</p>
      <ul>
        ${locations.map(l => `<li><a href="/wedding-videographer/${l.slug}">${escapeHtml(l.h1)}</a> — ${escapeHtml(l.region)}</li>`).join('')}
      </ul>
      <p><a href="/contact">Check your date</a> · <a href="/pricing">View packages</a></p>
    `);
    writePage('/wedding-videographer', rewritePage(template, { headBlock: hubHead, noscriptHtml: hubNoscript }));
  }

  for (const loc of locations) {
    const url = `${SITE_URL}/wedding-videographer/${loc.slug}`;

    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: loc.faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };

    const headBlock = buildHead({
      title: loc.metaTitle,
      description: loc.metaDescription,
      canonical: url,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
      jsonLd: faqLd,
    });

    const noscriptHtml = buildNoscript(`
      <p><a href="/wedding-videographer">← All service areas</a></p>
      <h1>${escapeHtml(loc.h1)}</h1>
      ${loc.intro.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      <h2>${escapeHtml(loc.venuesTitle)}</h2>
      <ul>
        ${loc.venues.map(v => `<li><strong>${escapeHtml(v.name)}</strong> — ${escapeHtml(v.note)}</li>`).join('')}
      </ul>
      <h2>Filming in ${escapeHtml(loc.shortName)}</h2>
      <p>${escapeHtml(loc.why)}</p>
      <h2>${escapeHtml(loc.shortName)} Wedding Videography FAQs</h2>
      ${loc.faqs.map(f => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('')}
      <p>Also serving: ${(loc.nearby || []).map(s => {
        const n = locations.find(l => l.slug === s);
        return n ? `<a href="/wedding-videographer/${n.slug}">${escapeHtml(n.name)}</a>` : '';
      }).filter(Boolean).join(' · ')}</p>
      <p><a href="/contact">Check your date</a> · <a href="/pricing">View packages</a> · <a href="/cine">Watch wedding films</a></p>
    `);

    writePage(`/wedding-videographer/${loc.slug}`, rewritePage(template, { headBlock, noscriptHtml }));
  }

  // ─── Regenerate sitemap.xml with current lastmod ───────────────────────────
  writeSitemap({ films, posts, locations });

  console.log(`\n✅ Prerender complete: ${staticRoutes.length} static + ${films.length} films + ${posts.length} posts\n`);
}

function writeSitemap({ films, posts, locations }) {

  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/cine`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/foto`, priority: '0.9', changefreq: 'monthly' },
    { loc: `${SITE_URL}/foto/wedding`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/foto/engagement`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/foto/portrait`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/pricing`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/testimonials`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${SITE_URL}/contact`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/blog`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/wedding-videographer`, priority: '0.9', changefreq: 'monthly' },
    ...locations.map(l => ({ loc: `${SITE_URL}/wedding-videographer/${l.slug}`, priority: '0.9', changefreq: 'monthly' })),
    ...posts.map(p => ({ loc: `${SITE_URL}/blog/${p.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: p.date })),
    ...films.map(f => ({ loc: `${SITE_URL}/cine/${f.slug}`, priority: '0.6', changefreq: 'yearly' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml);
  // Also write into public/ so it persists across builds
  fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml);
  console.log(`  ✓ sitemap.xml regenerated (${urls.length} URLs)`);
}

generateAll();
