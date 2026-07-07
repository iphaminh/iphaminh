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
        title="San Francisco Bay Area & Arkansas Wedding Videographer | Phaminh Cinematography"
        description="Minh Pham is a cinematic wedding videographer and photographer serving San Francisco, Oakland, Napa, Sonoma, Fayetteville AR, Bentonville AR, Little Rock AR, and destination weddings worldwide."
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
        poster="/assets/seo/phaminh-wedding-cover.jpg"
        controls={false}
        disablePictureInPicture
        onCanPlay={() => {
          const v = videoRef.current;
          if (v && v.paused) v.play().catch(() => {});
        }}
      >
        <source src="/assets/highlight_film/Phaminh-web.mp4" type="video/mp4" />
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
        <BadgesContainer />
        <RecentFilm />

        <nav aria-label="Explore the site" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '2rem 1rem', fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>
          <Link to="/cine" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>All Wedding Films</Link>
          <Link to="/foto" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>Photography Portfolio</Link>
          <Link to="/pricing" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>Packages & Pricing</Link>
          <Link to="/contact" style={{ color: '#333', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: 2 }}>Book Your Date</Link>
        </nav>

        <AboutMe />

        <section style={{ background: '#fafafa', padding: '2.5rem 2rem', textAlign: 'center', borderTop: '1px solid #eee' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.08em', color: '#333', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Serving Couples Across
          </h2>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', color: '#444', lineHeight: 2, maxWidth: 700, margin: '0 auto' }}>
            <strong>Northern California:</strong>{' '}
            <Link to="/wedding-videographer/san-francisco" style={{ color: '#444' }}>San Francisco</Link> ·{' '}
            <Link to="/wedding-videographer/napa-valley" style={{ color: '#444' }}>Napa Valley</Link> ·{' '}
            <Link to="/wedding-videographer/sonoma-healdsburg" style={{ color: '#444' }}>Sonoma & Healdsburg</Link> ·{' '}
            <Link to="/wedding-videographer/silicon-valley" style={{ color: '#444' }}>Silicon Valley</Link> ·{' '}
            <Link to="/wedding-videographer/marin-county" style={{ color: '#444' }}>Marin County</Link> ·{' '}
            <Link to="/wedding-videographer/half-moon-bay" style={{ color: '#444' }}>Half Moon Bay</Link> ·{' '}
            <Link to="/wedding-videographer/carmel-big-sur" style={{ color: '#444' }}>Carmel & Big Sur</Link> ·{' '}
            <Link to="/wedding-videographer/lake-tahoe" style={{ color: '#444' }}>Lake Tahoe</Link>
            <br />
            <strong>Northwest Arkansas:</strong>{' '}
            <Link to="/wedding-videographer/northwest-arkansas" style={{ color: '#444' }}>Fayetteville</Link> ·{' '}
            <Link to="/wedding-videographer/northwest-arkansas" style={{ color: '#444' }}>Bentonville</Link> ·{' '}
            <Link to="/wedding-videographer/northwest-arkansas" style={{ color: '#444' }}>Rogers</Link> ·{' '}
            <Link to="/wedding-videographer/northwest-arkansas" style={{ color: '#444' }}>Springdale</Link> ·{' '}
            <Link to="/wedding-videographer/northwest-arkansas" style={{ color: '#444' }}>Siloam Springs</Link> ·{' '}
            <Link to="/wedding-videographer/northwest-arkansas" style={{ color: '#444' }}>Bella Vista</Link> ·{' '}
            <Link to="/wedding-videographer/eureka-springs" style={{ color: '#444' }}>Eureka Springs</Link>
            <br />
            <strong>Central Arkansas:</strong>{' '}
            <Link to="/wedding-videographer/little-rock" style={{ color: '#444' }}>Little Rock</Link> ·{' '}
            <Link to="/wedding-videographer/little-rock" style={{ color: '#444' }}>Conway</Link> ·{' '}
            <Link to="/wedding-videographer/hot-springs" style={{ color: '#444' }}>Hot Springs</Link> ·{' '}
            <Link to="/wedding-videographer/little-rock" style={{ color: '#444' }}>Fort Smith</Link> ·{' '}
            <Link to="/wedding-videographer/little-rock" style={{ color: '#444' }}>Jonesboro</Link>
            <br />
            <em style={{ fontSize: '0.85rem', color: '#555' }}>Available for destination weddings worldwide.</em>
          </p>
        </section>

        <ShowcaseImage />
        <FooterShowcase />
      </div>
    </div>
  );
};

export default LandingPage;
