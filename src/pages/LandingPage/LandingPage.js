// src/pages/LandingPage/LandingPage.js
import React, { useRef, useState } from 'react';
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

    const currentlyMuted = videoRef.current.muted;
    videoRef.current.muted = !currentlyMuted;
    setIsMuted(!currentlyMuted);
  };

  return (
    <div className="landing-page-container">
      <SEO
        title="Bay Area & Arkansas Wedding Videographer | Cinematic Wedding Films by Phaminh"
        description="Emotional, cinematic wedding videography for couples in the San Francisco Bay Area and Arkansas. Story-driven films capturing priceless, authentic moments."
      />

 <video
  id="background-video"
  className="background-video"
  ref={videoRef}
  autoPlay
  loop
  playsInline
  muted={isMuted}
  poster="/assets/seo/phaminh-wedding-cover.jpg"
>
  <source
    src="/assets/highlight_film/Phaminh-web.mp4"
    type="video/mp4"
  />
  Your browser does not support the video tag.
</video>

      <img
        onClick={toggleMute}
        src={
          isMuted
            ? "/assets/highlight_film/noaudio.png"
            : "/assets/highlight_film/audio.png"
        }
        alt="Toggle Sound"
        className="sound-icon"
      />

      <BadgesContainer />
      <RecentFilm />
      <AboutMe />
      <ShowcaseImage />
      <FooterShowcase />
    </div>
  );
};

export default LandingPage;