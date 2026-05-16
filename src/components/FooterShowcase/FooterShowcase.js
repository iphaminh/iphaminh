// src/components/FooterShowcase/FooterShowcase.js
import React from 'react';
import './FooterShowcase.css';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm6.5-.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="currentColor" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M16 2.5V12a4 4 0 1 1-4-4V6a6 6 0 1 0 6 6V2.5z" fill="currentColor" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M21 7.5a2.5 2.5 0 0 0-2.5-2.5H5.5A2.5 2.5 0 0 0 3 7.5v9A2.5 2.5 0 0 0 5.5 19h13A2.5 2.5 0 0 0 21 16.5v-9zM10 15.5l6-3.5-6-3.5v7z" fill="currentColor" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M3 6.5l8.5 6 8.5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const FooterShowcase = () => {
  const footerLinkStyle = {
    color: '#fff',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
  };

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
            aria-label="Instagram"
            style={footerLinkStyle}
          >
            <InstagramIcon />
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@phaminh.cinematography"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            style={footerLinkStyle}
          >
            <TikTokIcon />
            TikTok
          </a>
          <a
            href="https://www.youtube.com/@phaminh"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            style={footerLinkStyle}
          >
            <YouTubeIcon />
            YouTube
          </a>
          <a
            href="mailto:phaminh@outlook.com"
            aria-label="Email"
            style={footerLinkStyle}
          >
            <EmailIcon />
            Email
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterShowcase;
