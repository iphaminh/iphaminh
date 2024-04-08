// src/pages/LandingPage/LandingPage.js
import React from 'react';
import BadgesContainer from '../../components/BadgesContainer/BadgesContainer';
import RecentFilm from '../../components/RecentFilm/RecentFilm';
import AboutMe from '../../components/AboutMe/AboutMe';
import ShowcaseImage from '../../components/ShowcaseImage/ShowcaseImage';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase'; // Import the FooterShowcase component
import './LandingPage.css'; // Assuming your CSS is in LandingPage.css



const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* This will place the video right under the navbar */}
      <video autoPlay muted loop playsInline id="background-video">
  <source src="/assets/highlight_film/Phaminh.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
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
