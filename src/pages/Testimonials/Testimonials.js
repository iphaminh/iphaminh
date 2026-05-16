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
        title="Wedding Videographer Reviews | Bay Area, NW Arkansas & Georgia Couples | Phaminh"
        description="Real reviews from couples in San Francisco, Fayetteville AR, Bentonville AR, Little Rock AR, and Georgia who trusted Phaminh Cinematography for their wedding films and photos."
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
