// Testimonials.js
import React from 'react';
import FullScreenImage from '../../components/TestimonialItem/FullScreenImage';
import TestimonialSection from '../../components/TestimonialItem/TestimonialSection';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import SEO from '../../components/SEO/SEO'; 
import './Testimonials.css';
import { routeMeta } from '../../data/routeMeta';

const Testimonials = () => {
  return (
    <>
      <SEO
        title={routeMeta['/testimonials'].title}
        description={routeMeta['/testimonials'].description}
        canonical={routeMeta['/testimonials'].canonical}
      />

      <FullScreenImage
        src="/assets/testimonials/phaminh-arkansas-sunset-wedding-photo.webp"
        alt="Arkansas Sunset Wedding"
      />

      <TestimonialSection />
      <FooterShowcase />
    </>
  );
};

export default Testimonials;
