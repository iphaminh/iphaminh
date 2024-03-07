// src/pages/Contact/Contact.js
import React from 'react';
import ContactForm from '../../components/ContactForm/ContactForm';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import './Contact.css';

const Contact = () => {
  return (
    <div className="bg-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4 ">LET’S START HERE</h1>
        <p className="text-lg text-center mb-12">
  Please fill out the contact form below to get more detailed
  <br />
  Information about the offered Wedding Collections and services.
</p>
        
        <ContactForm />

    <div className="contact-footer flex justify-between items-center border-t-2 py-4 mt-12">
      <span className="text-gray-700">870.270.8837</span>
      <div className="border-r-2 h-6"></div>
      <span className="text-gray-700">PHAMINH@OUTLOOK.COM</span>
    </div>
  </div>
  <FooterShowcase />
</div>
 );
};

export default Contact;
