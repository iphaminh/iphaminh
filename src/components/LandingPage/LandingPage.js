// src/components/LandingPage/LandingPage.js
import React from 'react';
import BadgesContainer from '../BadgesContainer/BadgesContainer';
import RecentFilm from '../RecentFilm/RecentFilm'; // Import the RecentFilm component

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* Other content like Navbar, video background, etc., goes here */}

      <BadgesContainer /> {/* Badges container should flow normally */}
      <RecentFilm /> {/* Recent Film should appear right after Badges container in normal flow */}

      {/* Any other content you want to include on the landing page */}
    </div>
  );
};

export default LandingPage;
