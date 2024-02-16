// LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import React Router Link

const LandingPage = () => {
  return (
    <div className="bg-blue-500 relative"> {/* Tailwind CSS class for blue background and relative positioning */}
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="w-full h-screen object-cover"
      >
        <source src="your-video-file.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-bold">
            Your Logo
          </Link>
        </div>
        <div className="flex space-x-6">
          {/* Navigation Links */}
          <Link to="/">Home</Link>
          <Link to="/cine">Cine</Link>
          <Link to="/foto">Foto</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/testimonial">Testimonial</Link>
        </div>
      </nav>
    </div>
  );
};

export default LandingPage;
