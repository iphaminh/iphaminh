// src/pages/LandingPage/LandingPage.js
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BadgesContainer from '../../components/BadgesContainer/BadgesContainer';
import RecentFilm from '../../components/RecentFilm/RecentFilm';
import AboutMe from '../../components/AboutMe/AboutMe';
import ShowcaseImage from '../../components/ShowcaseImage/ShowcaseImage';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import SEO from '../../components/SEO/SEO';
import './LandingPage.css';
import { routeMeta } from '../../data/routeMeta';
import locations from '../../data/locations.json';
import { films } from '../../data/films';
import { enrichmentFor } from '../../data/filmEnrichment';

// Phones get a 540p encode (8 MB) instead of the full 720p desktop file (36 MB).
// Decided once at load — background hero quality is indistinguishable on small screens.
const HERO_VIDEO =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    ? '/assets/highlight_film/Phaminh-web-mobile.mp4'
    : '/assets/highlight_film/Phaminh-web.mp4';

// "Where I film": the Northern California markets from locations.json (the same
// file LocationPage and prerender.js read), so a new California market added
// there appears here automatically. Arkansas pages stay live and are linked
// from the footer, but they are not part of the homepage's primary positioning.
const CALIFORNIA_GROUP = 'Northern California';
const californiaLocations = locations.filter((loc) => loc.group === CALIFORNIA_GROUP);

// "Watch" strip: film pages linked straight from the homepage so crawlers reach
// them from the strongest page on the site. Array order is display order.
const WATCH_SLUGS = [
  'destination-wedding-film',
  'elegant-moments-wedding-film',
  'intimate-wedding-story',
  'outdoor-celebration-wedding-film',
  'sunset-vows-wedding-film',
];
const watchFilms = WATCH_SLUGS
  .map((slug) => films.find((film) => film.slug === slug))
  .filter(Boolean);

// Avoids "Destination Wedding Film wedding film" for titles that already say Film.
const watchAlt = (film) =>
  /film/i.test(film.title)
    ? `${film.title} by Phaminh Cinematography`
    : `${film.title}, a wedding film by Phaminh Cinematography`;

const LandingPage = () => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="landing-page-container">
      <SEO
        title={routeMeta['/'].title}
        description={routeMeta['/'].description}
        canonical={routeMeta['/'].canonical}
      />

      <video
        id="background-video"
        className="background-video"
        ref={videoRef}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        fetchpriority="high"
        poster="/assets/seo/phaminh-wedding-cover.webp"
        controls={false}
        disablePictureInPicture
        onCanPlay={() => {
          const v = videoRef.current;
          if (v && v.paused) v.play().catch(() => {});
        }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
        <track kind="captions" srcLang="en" label="English captions" default />
        Your browser does not support the video tag.
      </video>

      <img
        onClick={toggleMute}
        src={
          isMuted
            ? `${process.env.PUBLIC_URL}/assets/highlight_film/noaudio.png`
            : `${process.env.PUBLIC_URL}/assets/highlight_film/audio.png`
        }
        alt={isMuted ? 'Unmute video' : 'Mute video'}
        width="64"
        height="64"
        className="sound-icon"
      />

      <div className="landing-page-content">
        {/* White intro band — carries the hero offset so the fullscreen video
            above stays clean. The H1 lives here, first thing in the white. */}
        <section className="home-intro">
          <p className="home-intro-eyebrow">Phaminh Cinematography</p>
          <h1 className="home-intro-h1">
            Cinematic Wedding Films — Napa Valley, the Bay Area &amp; Sacramento
          </h1>
          <div className="home-intro-rule" aria-hidden="true" />
          <p className="home-intro-body">
            I'm Minh Pham, a luxury wedding videographer based in Vacaville,
            California, between Napa Valley and Sacramento. I film one wedding
            a day, documentary at heart and cinematic in craft: your real vows,
            real toasts, and the moments in between, edited into a film you'll
            rewatch on every anniversary. Explore{' '}
            <Link to="/cine">recent wedding films</Link>,{' '}
            <Link to="/pricing">packages from $2,700</Link>, or{' '}
            <Link to="/wedding-videographer">everywhere I film</Link>.
          </p>
        </section>
        <BadgesContainer />
        <RecentFilm />

        <nav aria-label="Explore the site" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '2rem 1rem', fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>
          <Link to="/cine" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>All Wedding Films</Link>
          <Link to="/foto" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>Photography Portfolio</Link>
          <Link to="/pricing" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>Packages & Pricing</Link>
          <Link to="/contact" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>Book Your Date</Link>
        </nav>

        <AboutMe />

        {/* Watch strip: individual /cine/:slug film pages, plus an Explore row
            for pricing and the photography portfolios. */}
        <section className="home-watch" aria-labelledby="home-watch-heading">
          <div className="home-section-head">
            <p className="home-section-eyebrow">Portfolio</p>
            <h2 id="home-watch-heading" className="home-section-h2">
              Wedding Films to Watch
            </h2>
            <div className="home-section-rule" aria-hidden="true" />
            <p className="home-section-lead">
              A few films from the portfolio, each on its own page. Turn the sound on.
            </p>
          </div>

          <ul className="home-watch-strip">
            {watchFilms.map((film) => (
              <li key={film.slug} className="home-watch-card">
                <Link to={`/cine/${film.slug}`} className="home-watch-link">
                  <span className="home-watch-thumb">
                    <img
                      src={enrichmentFor(film.vimeoId).thumbnailUrl}
                      alt={watchAlt(film)}
                      loading="lazy"
                      decoding="async"
                      width="1920"
                      height="1080"
                    />
                  </span>
                  <span className="home-watch-title">{film.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          <nav className="home-explore" aria-label="Explore films, pricing and photography">
            <Link to="/cine">All wedding films</Link>
            <Link to="/pricing">Packages &amp; pricing</Link>
            <Link to="/foto">Wedding photography</Link>
            <Link to="/foto/portrait">Portrait sessions</Link>
          </nav>
        </section>

        {/* Where I film: every Northern California location page, data-driven
            from locations.json. One sentence for Arkansas, nothing more. */}
        <section className="home-where" aria-labelledby="home-where-heading">
          <div className="home-section-head">
            <p className="home-section-eyebrow">Locations</p>
            <h2 id="home-where-heading" className="home-section-h2">
              Where I Film in Northern California
            </h2>
            <div className="home-section-rule" aria-hidden="true" />
            <p className="home-section-lead">
              Based in Vacaville, I film weddings across Napa Valley, the Bay Area
              and Sacramento, and along the coast from Marin to Big Sur. Each
              location has its own page with the venues I love filming there and
              answers to common planning questions.
            </p>
          </div>

          <ul className="home-where-list">
            {californiaLocations.map((loc) => (
              <li key={loc.slug}>
                <Link to={`/wedding-videographer/${loc.slug}`}>{loc.name}</Link>
              </li>
            ))}
          </ul>

          <p className="home-where-note">
            Minh also films a handful of weddings each year in{' '}
            <Link to="/wedding-videographer/northwest-arkansas">Northwest Arkansas</Link>{' '}
            and Hot Springs.
            <em>Available for destination weddings worldwide.</em>
          </p>
        </section>

        <ShowcaseImage />
        <FooterShowcase />
      </div>
    </div>
  );
};

export default LandingPage;
