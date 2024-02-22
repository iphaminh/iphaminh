// src/components/FooterShowcase/FooterShowcase.js
import React, { useState } from 'react';
import './FooterShowcase.css';
import PhotonLogoFooter from "../PhotonLogoFooter";

const FooterShowcase = () => {
  return (
    <div className="footer-showcase-container">
      <div className="detail-section">
        <h3>Detail</h3>
        <p>Arkansas and Georgia's choice for wedding and elopement videography. Capturing your love story with cinematic elegance in stunning destinations. Your special day, beautifully immortalized.</p>
      </div>
      <div className="logo-section">
        <PhotonLogoFooter />
      </div>
      <div className="navigation-section">
  <div className="navbar-column navigate-heading">
    <h3>Navigate</h3>
  </div>
  <div className="navbar-column">
    <a href="#" className="navigation-link">Home</a>
    <a href="#" className="navigation-link">Cine</a>
    <a href="#" className="navigation-link">Foto</a>
  </div>
  <div className="navbar-column">
    <a href="#" className="navigation-link">Pricing</a>
    <a href="#" className="navigation-link">Contact</a>
    <a href="#" className="navigation-link">Testimonial</a>
  </div>
</div>
    </div>
  );
};

export default FooterShowcase;
