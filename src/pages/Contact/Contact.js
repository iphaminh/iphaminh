// src/pages/Contact/Contact.js
import React, { useState, useEffect } from 'react';
import ContactForm from '../../components/ContactForm/ContactForm';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import './Contact.css';

const Contact = () => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bannerImageURL = process.env.PUBLIC_URL + '/assets/images/georgia-wedding-highlights-phaminh-cinematography.png';

  return (
    <div>
      {/* Parallax banner image */}
      <div
        style={{
          backgroundImage: `url(${bannerImageURL})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: `center ${500 - offsetY * 0.1}%`, // Adjust the 0.1 to control the speed
          height: '400px', // Adjust the height as needed
          width: '100%',
        }}
      ></div>
      
      {/* Rest of the content */}
      <div className="bg-white p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4 ">LET’S START HERE</h1>
          <p className="text-lg text-center mb-12">
            Please fill out the contact form below to get more detailed
            <br />
            information about the offered Wedding Collections and services.
          </p>
          
          <ContactForm />
          
          <div className="contact-footer flex justify-between items-center border-t-2 py-4 mt-12">
            <span className="text-gray-700 mr-1">870.270.8837</span>
            <div className="border-r-2 h-6 mx-1"></div>
            <span className="text-gray-700 ml-1">PHAMINH@OUTLOOK.COM</span>
          </div>
        </div>
        <FooterShowcase />
      </div>
    </div>
  );
};

export default Contact;
