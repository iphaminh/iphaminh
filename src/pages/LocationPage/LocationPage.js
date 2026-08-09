// src/pages/LocationPage/LocationPage.js
// Data-driven local SEO landing pages — one per high-value market.
// Content lives in src/data/locations.json (also read by scripts/prerender.js).
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import locations from '../../data/locations.json';
import { films } from '../../data/films';
import { getBlogPost } from '../../data/blogPosts';
import './LocationPage.css';
import { routeMeta } from '../../data/routeMeta';

const SITE_URL = 'https://www.phaminh.com';

// Only films whose location genuinely matches the page's region. No cross-group
// fill: it used to put the first three ARKANSAS films on every Northern
// California page, which reads as fake local proof to couples and to Google.
// When there are no real matches, the section renders nothing.
const GROUP_KEYWORDS = {
  Arkansas: ['arkansas', 'ozark'],
  'Northern California': ['california', 'napa', 'sonoma', 'san francisco', 'bay area', 'carmel', 'big sur', 'tahoe', 'monterey', 'sacramento', 'vacaville', 'suisun', 'mountain view'],
};

function filmsForGroup(group, count = 3) {
  const keywords = GROUP_KEYWORDS[group] || [];
  return films
    .filter((f) => keywords.some((k) => f.location.toLowerCase().includes(k)))
    .slice(0, count);
}

// Hub page listing every market — rendered at /wedding-videographer
function LocationIndex() {
  return (
    <>
      <SEO
        title={routeMeta['/wedding-videographer'].title}
        description={routeMeta['/wedding-videographer'].description}
        canonical={routeMeta['/wedding-videographer'].canonical}
      />
      <div className="location-page">
        <header className="location-hero">
          <p className="location-region">Northern California & Arkansas</p>
          <h1>Where I Film Weddings</h1>
          <p className="location-intro-p">
            I'm Minh Pham, a wedding videographer based in Vacaville,
            California — between Napa Valley and Sacramento — with deep
            Arkansas roots. These are the regions I serve most — each with its
            own guide to venues, light, and planning your wedding film there.
          </p>
        </header>
        {['Northern California', 'Arkansas'].map((group) => (
          <section key={group}>
            <h2>{group}</h2>
            <ul className="location-index-list">
              {locations
                .filter((loc) => loc.group === group)
                .map((loc) => (
                  <li key={loc.slug}>
                    <Link to={`/wedding-videographer/${loc.slug}`}>
                      <span className="location-index-name">{loc.name}</span>
                      <span className="location-index-region">{loc.region}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        <div className="location-ctas">
          <Link to="/contact" className="location-cta location-cta-primary">Check Your Date</Link>
          <Link to="/pricing" className="location-cta location-cta-secondary">View Packages</Link>
        </div>
      </div>
      <FooterShowcase />
    </>
  );
}

export default function LocationPage() {
  const { slug } = useParams();

  if (!slug) return <LocationIndex />;

  const loc = locations.find((l) => l.slug === slug);

  if (!loc) {
    return (
      <div className="location-page">
        <Helmet>
          <meta name="robots" content="noindex" />
          <title>Page not found | Phaminh Cinematography</title>
        </Helmet>
        <h1>Page not found</h1>
        <p><Link to="/wedding-videographer">← All service areas</Link></p>
      </div>
    );
  }

  const url = `${SITE_URL}/wedding-videographer/${loc.slug}`;
  const featuredFilms = filmsForGroup(loc.group);
  const nearby = (loc.nearby || [])
    .map((s) => locations.find((l) => l.slug === s))
    .filter(Boolean);
  // Optional per-location guide links (relatedPosts is absent on entries added
  // before the field existed — always guard).
  const relatedPosts = (loc.relatedPosts || [])
    .map((slug) => getBlogPost(slug))
    .filter(Boolean);

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: loc.faqs.map((f) => ({
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

  return (
    <>
      <SEO
        title={loc.metaTitle}
        description={loc.metaDescription}
        canonical={url}
      >
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceLd)}</script>
      </SEO>

      <div className="location-page">
        <header className="location-hero">
          <p className="location-region">{loc.region}</p>
          <h1>{loc.h1}</h1>
        </header>

        <section className="location-intro">
          {loc.intro.map((p, i) => (
            <p key={i} className="location-intro-p">{p}</p>
          ))}
        </section>

        <section className="location-venues">
          <h2>{loc.venuesTitle}</h2>
          <ul>
            {loc.venues.map((v) => (
              <li key={v.name}>
                <strong>{v.name}</strong> — {v.note}
              </li>
            ))}
          </ul>
        </section>

        <section className="location-why">
          <h2>Filming in {loc.shortName}</h2>
          <p>{loc.why}</p>
        </section>

        {featuredFilms.length > 0 && (
          <section className="location-films">
            <h2>Recent Wedding Films</h2>
            <div className="location-films-grid">
              {featuredFilms.map((film) => (
                <Link key={film.slug} to={`/cine/${film.slug}`} className="location-film-card">
                  <img
                    src={`https://vumbnail.com/${film.vimeoId}.jpg`}
                    alt={`${film.title} — wedding film by Phaminh Cinematography`}
                    loading="lazy"
                    width="640"
                    height="360"
                  />
                  <span>{film.title}</span>
                </Link>
              ))}
            </div>
            <p className="location-films-more">
              <Link to="/cine">Watch the full portfolio →</Link>
            </p>
          </section>
        )}

        <section className="location-faqs">
          <h2>{loc.shortName} Wedding Videography FAQs</h2>
          {loc.faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        {relatedPosts.length > 0 && (
          <section className="location-nearby">
            <h2>Planning Resources</h2>
            <p>
              {relatedPosts.map((p, i) => (
                <React.Fragment key={p.slug}>
                  {i > 0 && ' · '}
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </React.Fragment>
              ))}
            </p>
          </section>
        )}

        {nearby.length > 0 && (
          <section className="location-nearby">
            <h2>Also Serving Nearby</h2>
            <p>
              {nearby.map((n, i) => (
                <React.Fragment key={n.slug}>
                  {i > 0 && ' · '}
                  <Link to={`/wedding-videographer/${n.slug}`}>{n.name}</Link>
                </React.Fragment>
              ))}
            </p>
          </section>
        )}

        <div className="location-ctas">
          <Link to="/contact" className="location-cta location-cta-primary">
            Check Your Date
          </Link>
          <Link to="/pricing" className="location-cta location-cta-secondary">
            View Packages
          </Link>
          <Link to="/testimonials" className="location-cta location-cta-secondary">
            Read Reviews
          </Link>
        </div>
      </div>

      <FooterShowcase />
    </>
  );
}
