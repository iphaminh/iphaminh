// src/components/FooterShowcase/FooterShowcase.js
import React from 'react';
import './FooterShowcase.css';

const FooterShowcase = () => {
  return (
    <footer className="footer-showcase-container">
      <div className="footer-showcase-content">
        <p className="footer-showcase-heading">
          Let’s create something beautiful together.
        </p>

        <div className="footer-showcase-links">
          <a
            href="https://www.instagram.com/phaminh.cinematography"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@phaminh.cinematography"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
          <a
            href="https://www.youtube.com/@phaminh"
            target="_blank"
            rel="noreferrer"
          >
            YouTube
          </a>
          <a href="mailto:phaminh@outlook.com">Email</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterShowcase;
