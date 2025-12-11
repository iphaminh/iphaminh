import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import './Foto.css';

const Foto = () => {
  return (
    <div className="foto-container">
      <SEO
        title="Wedding Photography Portfolio | Bay Area & Arkansas | Phaminh Cinematography"
        description="Browse wedding, engagement, portrait, and real estate photography from Phaminh. Serving the San Francisco Bay Area and Arkansas with cinematic visual storytelling."
      />
      {/* Category Links */}
      <div className="foto-categories">
        <Link to="/foto/wedding">Wedding</Link>
        <Link to="/foto/engagement">Engagement</Link>
        <Link to="/foto/portrait">Portrait</Link>
        {/* <Link to="/foto/family">Family</Link> */}
        <Link to="/foto/real-estate">Real Estate</Link>
      </div>

      {/* Gallery */}
      <div className="foto-gallery">
        <Outlet />
      </div>

      {/* Social Media Icons */}
      <div className="social-icons">
        <a
          href="https://www.facebook.com/lPhaminh"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/assets/images/facebook-phaminh.png" alt="Facebook" />
        </a>
        <a
          href="https://www.instagram.com/phaminh/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/assets/images/instagram-phaminh.png" alt="Instagram" />
        </a>
        <a
          href="https://www.youtube.com/@Phaminh-Cinematography"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/assets/images/youtube-phaminh.png" alt="YouTube" />
        </a>
        <a
          href="https://www.tiktok.com/@phaminhcinematography"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/assets/images/tiktok-phaminh.png" alt="TikTok" />
        </a>
      </div>
    </div>
  );
};

export default Foto;