// src/pages/LandingPage/LandingPage.js
import React from 'react';
import BadgesContainer from '../../components/BadgesContainer/BadgesContainer';
import RecentFilm from '../../components/RecentFilm/RecentFilm';
import AboutMe from '../../components/AboutMe/AboutMe';
import ShowcaseImage from '../../components/ShowcaseImage/ShowcaseImage';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase'; // Import the FooterShowcase component

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* Other content like Navbar, video background, etc., goes here */}
      <BadgesContainer />
      <RecentFilm />
      <AboutMe />
      <ShowcaseImage />
      <FooterShowcase />
       {/* Include the AboutMe component here */}
      {/* Any other content you want to include on the landing page */}
    </div>
  );
};

export default LandingPage;
