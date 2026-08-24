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

// Shared with the React app — single source of truth for static-route metadata
// and for the business entity schema (AI crawlers run no JS; without baking
// these into the static head, they never see the business at all).
const { routeMeta } = require(path.join(ROOT, 'src', 'data', 'routeMeta'));
const { websiteLd, businessLd, breadcrumbLdFor } = require(path.join(ROOT, 'src', 'data', 'businessSchema'));
const { films: FILMS } = require(FILMS_PATH);
const { blogPosts: BLOG_POSTS } = require(BLOG_PATH);
const { enrichmentFor, videoLdFor, filmPageTitle } = require(path.join(ROOT, 'src', 'data', 'filmEnrichment'));

const SITE_URL = 'https://www.phaminh.com';
const SITE_NAME = 'Phaminh Cinematography';
const DEFAULT_IMAGE = `${SITE_URL}/assets/seo/phaminh-wedding-cover.webp`;

// ──────────────────────────────────────────────────────────────────────────────
// Data extraction — parse films.js and blogPosts.js without needing to evaluate
// ──────────────────────────────────────────────────────────────────────────────

// films.js is CommonJS — require() it instead of regex-parsing, so new
// optional fields (date, venue, city, locationSlug) can never silently drop
// a film from prerender. assertParsedCount still cross-checks the source.
function parseFilms() {
  return FILMS;
}

// blogPosts.js is CommonJS — require() gives us sections verbatim for full-body
// static rendering (the old regex could only reach the metadata header).
function parseBlogPosts() {
  return BLOG_POSTS;
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

// Renders a complete <head> block for a page.
// `canonical` may be falsy (the 404 page) — then no canonical/og:url is emitted.
// `jsonLd` may be a single object or an array of schema.org objects.
// `robots` (e.g. 'noindex') emits a robots meta when present.
function buildHead({ title, description, canonical, ogImage, ogType, jsonLd, robots }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(ogImage);
  const safeType = escapeHtml(ogType || 'website');

  const ldBlocks = (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])
    .map(ld => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
    .join('\n    ');

  const canonicalTags = canonical
    ? `<link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />`
    : '';
  // rewritePage strips the template's robots meta, so this tag is the only
  // directive on the page — pass 'noindex' to exclude a page from indexing.
  const robotsTag = `<meta name="robots" content="${escapeHtml(robots || 'index,follow,max-image-preview:large')}" />`;

  return `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    ${robotsTag}
    ${canonicalTags}
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:type" content="${safeType}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    ${ldBlocks}
  `.trim();
}

// Mirrors BlogPost.js renderInline: **bold** and [text](url), on escaped text.
function renderInlineMd(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => `<a href="${href}">${label}</a>`);
  return out;
}

// Mirrors BlogPost.js renderContent: paragraphs and '- ' lists.
function renderContentMd(content) {
  return String(content).split('\n\n').map(block => {
    if (!block.trim()) return '';
    if (block.trim().startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter(Boolean)
        .map(line => `<li>${renderInlineMd(line.replace(/^- /, ''))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${renderInlineMd(block)}</p>`;
  }).join('');
}

// Full post body for the static page — headings, sections, and FAQs.
function renderPostBody(post) {
  const sections = (post.sections || []).map(s => {
    const heading = s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : '';
    return `${heading}${renderContentMd(s.content || '')}`;
  }).join('');
  const faqs = (post.faqs || []).length
    ? `<h2>Frequently Asked Questions</h2>` + post.faqs.map(f =>
        `<h3>${escapeHtml(f.question)}</h3>${renderContentMd(f.answer || '')}`).join('')
    : '';
  return sections + faqs;
}

// Renders the static content block that goes INSIDE <div id="root"> — what
// crawlers and no-JS visitors see. Several AI crawlers skip <noscript>
// entirely, so this is a real div: React 18 createRoot().render() replaces
// the container's children on mount (src/index.js uses createRoot), so
// hydrated users only ever see the React app.
function buildNoscript(html) {
  return `<div class="prerender-content" style="max-width:900px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.6;color:#222">${html}</div>`;
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
    .replace(/<meta name="robots"[^>]*\/?>/, '')
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

  // Drop the template's noscript notice and put the static content INSIDE
  // #root, where crawlers that skip <noscript> still read it. createRoot()
  // replaces these children on mount, so users see only the React app.
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  html = html.replace('<div id="root"></div>', `<div id="root">${noscriptHtml}</div>`);

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

// A parser that silently drops an entry unpublishes that page: with the SPA
// catch-all gone from .htaccess, a missing prerender file is a hard 404 in
// production. Count `slug:` fields at line starts (template-literal bodies
// can't skew that) and fail the build loudly on any mismatch.
function assertParsedCount(kind, parsed, sourcePath) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const expected = (source.match(/^\s*slug:\s*'/gm) || []).length;
  if (parsed.length !== expected || parsed.length === 0) {
    throw new Error(
      `${kind} parser mismatch: parsed ${parsed.length} entries but ${path.basename(sourcePath)} ` +
      `declares ${expected} slugs. A field was likely added/reordered — update the parser in scripts/prerender.js.`
    );
  }
}

function generateAll() {
  const template = loadTemplate();
  const films = parseFilms();
  const posts = parseBlogPosts();
  const locations = JSON.parse(fs.readFileSync(LOCATIONS_PATH, 'utf8'));

  assertParsedCount('films', films, FILMS_PATH);
  assertParsedCount('blog posts', posts, BLOG_PATH);

  console.log(`\nPrerendering: ${films.length} films, ${posts.length} blog posts, ${locations.length} location pages, plus static routes\n`);

  // ─── Static routes ─────────────────────────────────────────────────────────
  const staticRoutes = [
    {
      path: '/',
      noscript: `
        <h1>Cinematic Wedding Films — Napa Valley, the Bay Area & Sacramento</h1>
        <p>Minh Pham is a luxury wedding videographer based in Vacaville, California — between Napa Valley and Sacramento — creating cinematic wedding films and photography for couples across Napa, Sonoma, San Francisco, the Bay Area, Sacramento, Vacaville & Suisun Valley, and Northwest Arkansas.</p>
        <h2>Where I Film</h2>
        <p><a href="/wedding-videographer/vacaville-suisun-valley">Vacaville & Suisun Valley</a> · <a href="/wedding-videographer/napa-valley">Napa Valley</a> · <a href="/wedding-videographer/sacramento">Sacramento</a> · <a href="/wedding-videographer">all service areas</a></p>
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
      noscript: `<h1>Wedding Photography Portfolio</h1><p>Real weddings photographed by Phaminh Cinematography across California and Arkansas.</p>`,
    },
    {
      path: '/foto/engagement',
      noscript: `<h1>Engagement Photography</h1><p>Relaxed, story-driven engagement sessions for Bay Area and Arkansas couples.</p>`,
    },
    {
      path: '/foto/portrait',
      noscript: `<h1>Portrait Photography</h1><p>Natural light portrait sessions by Phaminh Cinematography.</p>`,
    },
    {
      path: '/pricing',
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
      noscript: `<h1>Client Reviews</h1><p>Real reviews from real couples — <a href="/contact">book your own film</a>.</p>`,
    },
    {
      path: '/blog',
      noscript: `
        <h1>Phaminh Wedding Blog</h1>
        <p>Practical guides for couples planning their wedding film.</p>
        <ul>
          ${posts.map(p => `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.description)}</li>`).join('')}
        </ul>
      `,
    },
  ];

  // Per-route structured-data extras beyond the shared entity blocks.
  const staticRouteLd = {
    '/cine': [{
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Wedding Films by Phaminh Cinematography',
      itemListElement: films.map((f, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: f.title,
        url: `${SITE_URL}/cine/${f.slug}`,
      })),
    }],
    '/pricing': [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much does a wedding videographer cost in Napa Valley and the Bay Area?',
          acceptedAnswer: { '@type': 'Answer', text: 'Most couples in Napa Valley, the Bay Area, and Sacramento invest $2,700-$8,000 in their wedding film with Phaminh Cinematography. Full-day cinematic coverage starts at $2,700; elopement films start at $2,500. There are no travel fees anywhere in Solano, Napa, or Sacramento counties.' },
        },
        {
          '@type': 'Question',
          name: 'How much does a wedding videographer cost in Northwest Arkansas?',
          acceptedAnswer: { '@type': 'Answer', text: 'Wedding films in Northwest Arkansas, Eureka Springs, Hot Springs, and Little Rock start at $2,700 for full-day cinematic coverage, with elopement films from $2,500.' },
        },
        {
          '@type': 'Question',
          name: 'What is included in a wedding film package?',
          acceptedAnswer: { '@type': 'Answer', text: 'Every package includes a cinematic highlight film edited from your real vows, toasts, and candid moments. Longer edits, full-ceremony films, drone coverage, and photography add-ons are available — see the pricing page for current packages.' },
        },
      ],
    }],
  };

  for (const route of staticRoutes) {
    const meta = routeMeta[route.path];
    if (!meta) throw new Error(`No routeMeta entry for static route ${route.path} — add it to src/data/routeMeta.js`);
    const routeLd = [websiteLd, businessLd];
    const crumbs = breadcrumbLdFor(route.path);
    if (crumbs) routeLd.push(crumbs);
    routeLd.push(...(staticRouteLd[route.path] || []));
    const headBlock = buildHead({
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
      jsonLd: routeLd,
    });
    const noscriptHtml = buildNoscript(route.noscript);
    writePage(route.path, rewritePage(template, { headBlock, noscriptHtml }));
  }

  // ─── 404 page ──────────────────────────────────────────────────────────────
  // Apache's ErrorDocument (.htaccess) serves this with a real 404 status.
  // A root-level FILE, not a directory — build/404.html/index.html would break
  // the ErrorDocument reference. noindex + no canonical: the file is also
  // directly fetchable at /404.html with a 200, and must never be indexed.
  // Keeps the CRA JS bundle so humans still get the styled React NotFound page.
  {
    const headBlock = buildHead({
      title: 'Page Not Found | Phaminh Cinematography',
      description: "The page you're looking for doesn't exist.",
      robots: 'noindex',
      ogImage: DEFAULT_IMAGE,
    });
    const noscriptHtml = buildNoscript(`
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/cine">Wedding Films</a></li>
        <li><a href="/wedding-videographer">Service Areas</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    `);
    fs.writeFileSync(path.join(BUILD_DIR, '404.html'), rewritePage(template, { headBlock, noscriptHtml }));
    console.log('  ✓ /404.html (root file for ErrorDocument)');
  }

  // ─── Film pages ────────────────────────────────────────────────────────────
  for (const film of films) {
    const url = `${SITE_URL}/cine/${film.slug}`;
    const title = filmPageTitle(film);
    const enrichment = enrichmentFor(film.vimeoId);
    const thumbnail = enrichment.thumbnailUrl;
    const videoLandingUrl = `https://vimeo.com/${film.vimeoId}`;

    // Shared with FilmPage.js — identical static and hydrated VideoObject.
    const videoLd = videoLdFor(film);

    const headBlock = buildHead({
      title,
      description: film.description,
      canonical: url,
      ogImage: thumbnail,
      ogType: 'video.other',
      jsonLd: [websiteLd, businessLd, breadcrumbLdFor(`/cine/${film.slug}`, { [film.slug]: film.title }), videoLd],
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
    // metaTitle is the ≤65-char search title; the full title stays as the H1.
    const title = `${post.metaTitle || post.title} | Phaminh`;

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
      jsonLd: [websiteLd, businessLd, breadcrumbLdFor(`/blog/${post.slug}`, { [post.slug]: post.title }), articleLd],
    });

    const noscriptHtml = buildNoscript(`
      <p><a href="/blog">← All Articles</a></p>
      <h1>${escapeHtml(post.title)}</h1>
      <p><em>${escapeHtml(post.date)} · ${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</em></p>
      ${renderPostBody(post)}
      <p><a href="/contact">Check your date</a> · <a href="/pricing">View packages</a> · <a href="/wedding-videographer">Service areas</a></p>
    `);

    writePage(`/blog/${post.slug}`, rewritePage(template, { headBlock, noscriptHtml }));
  }

  // ─── Location landing pages ────────────────────────────────────────────────
  {
    const hubMeta = routeMeta['/wedding-videographer'];
    const hubHead = buildHead({
      title: hubMeta.title,
      description: hubMeta.description,
      canonical: hubMeta.canonical,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
      jsonLd: [websiteLd, businessLd, breadcrumbLdFor('/wedding-videographer')],
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

    const serviceLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Wedding Videography in ${loc.name}`,
      serviceType: 'Wedding videography',
      areaServed: { '@type': 'AdministrativeArea', name: loc.name },
      provider: { '@id': `${SITE_URL}/#localbusiness` },
      url,
    };

    const headBlock = buildHead({
      title: loc.metaTitle,
      description: loc.metaDescription,
      canonical: url,
      ogImage: DEFAULT_IMAGE,
      ogType: 'website',
      jsonLd: [websiteLd, businessLd, breadcrumbLdFor(`/wedding-videographer/${loc.slug}`, { [loc.slug]: loc.name }), faqLd, serviceLd],
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
      ${(loc.relatedPosts || []).length ? `<h2>Planning Resources</h2><p>${(loc.relatedPosts || []).map(s => {
        const rp = posts.find(p => p.slug === s);
        return rp ? `<a href="/blog/${rp.slug}">${escapeHtml(rp.title)}</a>` : '';
      }).filter(Boolean).join(' · ')}</p>` : ''}
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
    // /foto/wedding intentionally absent: it duplicates /foto (same component)
    // and canonicalizes there.
    { loc: `${SITE_URL}/foto/engagement`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/foto/portrait`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/pricing`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/testimonials`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${SITE_URL}/contact`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/blog`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/wedding-videographer`, priority: '0.9', changefreq: 'monthly' },
    ...locations.map(l => ({ loc: `${SITE_URL}/wedding-videographer/${l.slug}`, priority: '0.9', changefreq: 'monthly' })),
    ...posts.map(p => ({ loc: `${SITE_URL}/blog/${p.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: p.date })),
    ...films.map(f => {
      const e = enrichmentFor(f.vimeoId);
      return {
        loc: `${SITE_URL}/cine/${f.slug}`,
        priority: '0.6',
        changefreq: 'yearly',
        ...(e.uploadDate ? { lastmod: e.uploadDate.slice(0, 10) } : {}),
        video: {
          title: f.title,
          description: f.description,
          thumbnail: e.thumbnailUrl,
          playerLoc: `https://player.vimeo.com/video/${f.vimeoId}`,
          durationSeconds: e.durationSeconds,
          publicationDate: e.uploadDate,
        },
      };
    }),
  ];

  // XML text fields need their own escaping — one raw '&' in a film title
  // invalidates the entire sitemap for Google.
  const escapeXml = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  const videoBlock = u => {
    if (!u.video) return '';
    const v = u.video;
    return `
    <video:video>
      <video:thumbnail_loc>${escapeXml(v.thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:player_loc>${escapeXml(v.playerLoc)}</video:player_loc>${v.durationSeconds ? `
      <video:duration>${Math.round(v.durationSeconds)}</video:duration>` : ''}${v.publicationDate ? `
      <video:publication_date>${escapeXml(v.publicationDate)}</video:publication_date>` : ''}
    </video:video>`;
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${videoBlock(u)}
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml);
  // Also write into public/ so it persists across builds
  fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml);
  console.log(`  ✓ sitemap.xml regenerated (${urls.length} URLs)`);
}

generateAll();
