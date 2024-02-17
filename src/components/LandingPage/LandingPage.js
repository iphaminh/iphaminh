import React from 'react';
import { Link } from 'react-router-dom';
import BadgesContainer from '../BadgesContainer/BadgesContainer'; // Import BadgesContainer

const LandingPage = () => {
  return (
    <div className="relative">
      <video autoPlay loop muted className="w-full h-screen object-cover">
        <source src="your-video-file.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        {/* Navigation content */}
      </nav>
      
      <BadgesContainer /> {/* Include BadgesContainer component here */}
    </div>
  );
};

export default LandingPage;
