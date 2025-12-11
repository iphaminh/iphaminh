// Testimonials.js
import React from 'react';
import FullScreenImage from '../../components/TestimonialItem/FullScreenImage';
import TestimonialSection from '../../components/TestimonialItem/TestimonialSection';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import SEO from '../../components/SEO/SEO'; 
import './Testimonials.css';

const Testimonials = () => {
  return (
    <>
      <SEO
        title="Wedding Testimonials | Real Couples • Real Stories | Phaminh Cinematography"
        description="Read testimonials from real wedding couples who trusted Phaminh Cinematography. Heartfelt experiences from California and Arkansas brides and grooms."
      />

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