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
        poster="/assets/seo/phaminh-wedding-cover.jpg"
        controls={false}
        disablePictureInPicture
        onCanPlay={() => {
          const v = videoRef.current;
          if (v && v.paused) v.play().catch(() => {});
        }}
      >
        <source src="/assets/highlight_film/Phaminh-web.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <img
        onClick={toggleMute}
        src={
          isMuted
            ? `${process.env.PUBLIC_URL}/assets/highlight_film/noaudio.png`
            : `${process.env.PUBLIC_URL}/assets/highlight_film/audio.png`
        }
        alt="Toggle Sound"
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
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', color: '#666', lineHeight: 2, maxWidth: 700, margin: '0 auto' }}>
            <strong>Bay Area:</strong> San Francisco · Oakland · San Jose · Berkeley · Napa · Sonoma · Marin · Palo Alto · Walnut Creek · Fremont · Sacramento
            <br />
            <strong>Northwest Arkansas:</strong> Fayetteville · Bentonville · Rogers · Springdale · Siloam Springs · Bella Vista · Eureka Springs
            <br />
            <strong>Central Arkansas:</strong> Little Rock · Conway · Hot Springs · Fort Smith · Jonesboro
            <br />
            <em style={{ fontSize: '0.85rem', color: '#999' }}>Available for destination weddings worldwide.</em>
          </p>
        </section>

        <ShowcaseImage />
        <FooterShowcase />
      </div>
    </div>
  );
};

export default LandingPage;
