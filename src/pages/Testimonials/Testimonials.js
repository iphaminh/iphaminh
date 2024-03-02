// Testimonials.js
import React from 'react';
import FullScreenImage from '../../components/TestimonialItem/FullScreenImage'; // Adjust the import path as necessary
import TestimonialSection from '../../components/TestimonialItem/TestimonialSection';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import './Testimonials.css'; // 

const Testimonials = () => {
  return (
    <>
      <FullScreenImage
        src="/assets/testimonials/phaminh-arkansas-sunset-wedding-photo.png"
        alt="Arkansas Sunset Wedding"
      />
      <TestimonialSection />
      <FooterShowcase />
    </>
  );
};

export default Testimonials;
