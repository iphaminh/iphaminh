import React, { useState, useEffect, useRef } from 'react';
import './AboutMe.css';

const AboutMe = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const aboutMeRef = useRef();

  const handleScroll = () => {
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
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAnimated]); // Dependency array includes isAnimated to re-add event listener


  return (
    <div className="aboutMeContainer" ref={aboutMeRef}>
      <div className={`aboutMeContent ${isVisible ? 'slide-in' : ''}`}>
        <h2>I'm MINH!</h2>
        <p>
          Passionate about capturing life's moments, I specialize in turning
          visions into cinematic stories. Away from the camera, I'm exploring
          nature or engaging with the latest tech. My goal: to uniquely narrate
          your love story through my lens.
        </p>
      </div>
      <div className={`aboutMeImage ${isVisible ? 'fade-in' : ''}`}>
        <img src="/assets/images/phaminh-cinematography.png" alt="Cinematographer MINH in natural setting" />
      </div>
    </div>
  );
};

export default AboutMe;
