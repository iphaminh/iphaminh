// src/components/LandingPage/LandingPage.js
import React from 'react';
import BadgesContainer from '../BadgesContainer/BadgesContainer';
import RecentFilm from '../RecentFilm/RecentFilm';
import AboutMe from '../AboutMe/AboutMe'; // Import the AboutMe component
import ShowcaseImage from '../ShowcaseImage/ShowcaseImage'; // Import the new component
import FooterShowcase from '../FooterShowcase/FooterShowcase';

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
