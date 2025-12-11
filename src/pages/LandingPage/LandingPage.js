// src/pages/LandingPage/LandingPage.js
import React, { useRef, useState } from 'react';
import BadgesContainer from '../../components/BadgesContainer/BadgesContainer';
import RecentFilm from '../../components/RecentFilm/RecentFilm';
import AboutMe from '../../components/AboutMe/AboutMe';
import ShowcaseImage from '../../components/ShowcaseImage/ShowcaseImage';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase'; // Import the FooterShowcase component
import SEO from '../../components/SEO/SEO';
import './LandingPage.css'; // Assuming your CSS is in LandingPage.css

const LandingPage = () => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      const currentlyMuted = videoRef.current.muted;
      videoRef.current.muted = !currentlyMuted;
      setIsMuted(!currentlyMuted);
    }
  };

  return (
    <div className="landing-page-container">
      <SEO
        title="Bay Area & Arkansas Wedding Videographer | Cinematic Wedding Films by Phaminh"
        description="Emotional, cinematic wedding videography for couples in the San Francisco Bay Area and Arkansas. Story‑driven films capturing priceless, authentic moments."
      />
      <video
        autoPlay
        loop
        playsInline
        id="background-video"
        ref={videoRef}
        muted={isMuted}
      >
        <source src="/assets/highlight_film/Phaminh.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <img
  onClick={toggleMute}
  src={isMuted ? "assets/highlight_film/noaudio.png" : "assets/highlight_film/audio.png"}
  alt="Toggle Sound"
  className="sound-icon"
/>
      <BadgesContainer />
      <RecentFilm />
      <AboutMe />
      <ShowcaseImage />
      <FooterShowcase />
      {/* ... other content */}
    </div>
  );
};

export default LandingPage;
