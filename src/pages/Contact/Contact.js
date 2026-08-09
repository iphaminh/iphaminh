// src/pages/Contact/Contact.js
import React, { useState, useEffect } from 'react';
import ContactForm from '../../components/ContactForm/ContactForm';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import SEO from '../../components/SEO/SEO';
import './Contact.css';
import { routeMeta } from '../../data/routeMeta';

const Contact = () => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bannerImageURL = process.env.PUBLIC_URL + '/assets/images/georgia-wedding-highlights-phaminh-cinematography.webp';

  return (
    <div>
      <SEO
        title={routeMeta['/contact'].title}
        description={routeMeta['/contact'].description}
        canonical={routeMeta['/contact'].canonical}
      />
      {/* Parallax banner image */}
      <div
        style={{
          backgroundImage: `url(${bannerImageURL})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',

          backgroundPosition: `center ${300 - offsetY * 0.1}%`, // Adjust the 0.1 to control the speed
          height: '400px', // Adjust the height as needed
          width: '100%',
        }}
      ></div>
      
      {/* Rest of the content */}
      <div className="contact-page-content">
        <div className="contact-page-inner">
          <h1 className="contact-page-title">LET’S START HERE</h1>
          <p className="contact-page-intro">
            Please fill out the contact form below to get more detailed
            information about the offered Wedding Collections and services.
          </p>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Serving San Francisco · Oakland · Napa · Sonoma · San Jose · East Bay &amp; all of Northern California
            <br />
            Fayetteville · Bentonville · Rogers · Springdale · Little Rock · Hot Springs &amp; all of Arkansas
            <br />
            Available for destination weddings worldwide.
          </p>
          
          <ContactForm />
          
          <div className="contact-footer">
            <span>870.270.8837</span>
            <div className="contact-footer-divider"></div>
            <span>PHAMINH@OUTLOOK.COM</span>
          </div>
        </div>
        <FooterShowcase />
      </div>
    </div>
  );
};

export default Contact;
