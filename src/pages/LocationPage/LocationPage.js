// src/pages/LocationPage/LocationPage.js
// Data-driven local SEO landing pages — one per high-value market.
// Content lives in src/data/locations.json (also read by scripts/prerender.js).
//
// Every entry has the core fields (h1, intro, venues, why, faqs). Entries used
// as ad landing pages may also carry three OPTIONAL fields, each guarded here
// because older entries do not have them:
//   venueDetail: string[]        3-4 paragraphs rendered after the venue list
//   featuredVimeoIds: string[]   2-3 Vimeo IDs rendered as click-to-play embeds
//   testimonial: { quote, couple, venue } | null   one client quote
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import ContactForm from '../../components/ContactForm/ContactForm';
import locations from '../../data/locations.json';
import vimeoVideos from '../../data/vimeo-videos.json';
import { films } from '../../data/films';
import { enrichmentFor } from '../../data/filmEnrichment';
import { getBlogPost } from '../../data/blogPosts';
import './LocationPage.css';
import { routeMeta } from '../../data/routeMeta';

const SITE_URL = 'https://www.phaminh.com';
// id of the on-page inquiry form; hero and bottom CTAs jump to it.
const INQUIRY_ID = 'check-your-date';

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

// Resolves loc.featuredVimeoIds into embeddable films. The label is the real
// Vimeo title from the auto-updated feed (src/data/vimeo-videos.json), falling
// back to the curated films.js title when the feed has not caught up yet. An
// ID with no title in either source is dropped rather than labelled with a
// guess. When the film also exists in films.js, its /cine/:slug page is linked.
function featuredEmbedsFor(loc) {
  const ids = Array.isArray(loc.featuredVimeoIds) ? loc.featuredVimeoIds : [];
  return ids
    .map((rawId) => {
      const vimeoId = String(rawId);
      const feed = vimeoVideos.find((v) => String(v.id) === vimeoId);
      const curated = films.find((f) => String(f.vimeoId) === vimeoId);
      const title = (feed && feed.title) || (curated && curated.title);
      if (!title) return null;
      return {
        vimeoId,
        title,
        thumbnailUrl: enrichmentFor(vimeoId).thumbnailUrl,
        filmSlug: curated ? curated.slug : null,
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

// Click-to-play facade: the page loads only the Vimeo poster image (no player
// JS) until the visitor presses play, then swaps in the autoplaying iframe.
// Without JavaScript the poster is a plain link to the film on vimeo.com.
function FilmEmbed({ film }) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = `https://vimeo.com/${film.vimeoId}`;
  const embedUrl =
    `https://player.vimeo.com/video/${film.vimeoId}` +
    `?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;

  return (
    <figure className="location-embed">
      <div className="location-embed-frame">
        {playing ? (
          <iframe
            title={film.title}
            src={embedUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a
            href={watchUrl}
            className="location-embed-poster"
            aria-label={`Play ${film.title}`}
            onClick={(e) => {
              e.preventDefault();
              setPlaying(true);
            }}
          >
            <img
              src={film.thumbnailUrl}
              alt={`${film.title}, wedding film by Phaminh Cinematography`}
              loading="lazy"
              width="640"
              height="360"
            />
            <span className="location-embed-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </a>
        )}
      </div>
      <figcaption className="location-embed-caption">
        <span className="location-embed-title">{film.title}</span>
        {film.filmSlug && (
          <Link to={`/cine/${film.filmSlug}`} className="location-embed-link">
            Full film page
          </Link>
        )}
      </figcaption>
    </figure>
  );
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
            California, between Napa Valley and Sacramento, with deep
            Arkansas roots. These are the regions I serve most, each with its
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
  const featuredEmbeds = featuredEmbedsFor(loc);
  const venueDetail = Array.isArray(loc.venueDetail) ? loc.venueDetail.filter(Boolean) : [];
  const testimonial =
    loc.testimonial && loc.testimonial.quote && loc.testimonial.couple
      ? loc.testimonial
      : null;
  // Strip any quotation marks already in the data so the rendered quote is
  // never double-wrapped.
  const quoteText = testimonial
    ? String(testimonial.quote).trim().replace(/^["“”']+|["“”']+$/g, '')
    : '';
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
          <p className="location-hero-ctas">
            <a href={`#${INQUIRY_ID}`} className="location-cta location-cta-primary">
              Check Your Date
            </a>
            <Link to="/pricing" className="location-cta location-cta-secondary">
              View Packages
            </Link>
          </p>
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
                <strong>{v.name}</strong>: {v.note}
              </li>
            ))}
          </ul>
          {venueDetail.length > 0 && (
            <div className="location-venue-detail">
              {venueDetail.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </section>

        <section className="location-why">
          <h2>Filming in {loc.shortName}</h2>
          <p>{loc.why}</p>
        </section>

        {featuredEmbeds.length > 0 ? (
          <section className="location-films location-films-embeds">
            <p className="location-eyebrow">Watch</p>
            <h2>Wedding Films</h2>
            <div className="location-embeds-grid" data-count={featuredEmbeds.length}>
              {featuredEmbeds.map((film) => (
                <FilmEmbed key={film.vimeoId} film={film} />
              ))}
            </div>
            <p className="location-films-more">
              <Link to="/cine">Watch the full portfolio →</Link>
            </p>
          </section>
        ) : (
          featuredFilms.length > 0 && (
            <section className="location-films">
              <h2>Recent Wedding Films</h2>
              <div className="location-films-grid">
                {featuredFilms.map((film) => (
                  <Link key={film.slug} to={`/cine/${film.slug}`} className="location-film-card">
                    <img
                      src={enrichmentFor(film.vimeoId).thumbnailUrl}
                      alt={`${film.title}, wedding film by Phaminh Cinematography`}
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
          )
        )}

        {testimonial && (
          <section className="location-quote-section">
            <blockquote className="location-quote">
              <p>“{quoteText}”</p>
              <cite>
                <span className="location-quote-couple">{testimonial.couple}</span>
                {testimonial.venue && (
                  <span className="location-quote-venue">{testimonial.venue}</span>
                )}
              </cite>
            </blockquote>
          </section>
        )}

        <section className="location-inquiry" id={INQUIRY_ID}>
          <div className="location-inquiry-header">
            <p className="location-eyebrow">Availability</p>
            <h2>Check Your Date</h2>
            <p className="location-inquiry-lead">
              Share your date, venue, and a little about the {loc.shortName} wedding
              you are planning. I film one wedding per day, so the sooner I hear from
              you, the better the chance your date is still open.
            </p>
          </div>
          <ContactForm formId={`location-${loc.slug}`} />
          <p className="location-inquiry-alt">
            Want to see the collections first? <Link to="/pricing">View packages</Link>.
          </p>
        </section>

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
          <a href={`#${INQUIRY_ID}`} className="location-cta location-cta-primary">
            Check Your Date
          </a>
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
