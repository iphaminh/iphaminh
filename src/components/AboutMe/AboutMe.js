import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './AboutMe.css';

const AboutMe = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const aboutMeRef = useRef();

  const handleScroll = useCallback(() => {
    if (aboutMeRef.current) {
      const top = aboutMeRef.current.getBoundingClientRect().top;
      const onScreen = top < window.innerHeight && top > 0;

      // Set the section as visible only if it hasn't been animated yet
      if (onScreen && !isAnimated) {
        setIsVisible(true);
        setIsAnimated(true); // Prevent further animations
      }

      // Reset the animation if the section is no longer visible
      if (!onScreen && isAnimated) {
        setIsVisible(false);
        setIsAnimated(false); // Allow animation to trigger again
      }
    }
  }, [isAnimated]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="aboutMeContainer" ref={aboutMeRef}>
      <div className={`aboutMeContent ${isVisible ? 'slide-in' : ''}`}>
        <h2>I'm MINH!</h2>
        <p>
          I'm Minh Pham, a wedding videographer and photographer based between
          the San Francisco Bay Area and Arkansas. I serve couples in San
          Francisco, Oakland, Napa, Sonoma, and all of Northern California —
          as well as Fayetteville, Bentonville, Rogers, Little Rock, and
          throughout the Natural State. I create cinematic wedding films with a
          calm, story-first approach, so your day feels natural while the
          memories are preserved with intention.
        </p>
        <p style={{ marginTop: '1.2rem', fontSize: '0.95em' }}>
          <Link to="/cine" style={{ color: '#555', marginRight: '1.5rem' }}>Watch my films →</Link>
          <Link to="/foto" style={{ color: '#555', marginRight: '1.5rem' }}>See photography →</Link>
          <Link to="/contact" style={{ color: '#555' }}>Get in touch →</Link>
        </p>
      </div>
      <div className={`aboutMeImage ${isVisible ? 'fade-in' : ''}`}>
        <img
          src="/assets/images/phaminh-cinematography.png"
          alt="Minh Pham, Bay Area and Arkansas wedding videographer"
          width="600"
          height="594"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default AboutMe;
