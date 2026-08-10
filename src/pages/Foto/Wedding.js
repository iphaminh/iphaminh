// pages/Wedding.js
import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../../components/Foto/Gallery';
import SEO from '../../components/SEO/SEO';
import { routeMeta } from '../../data/routeMeta';

const images = [
  'phaminh-wedding-photo-2.webp',
  'phaminh-wedding-photo-3.webp',
  'phaminh-wedding-photo-4.webp',
  'phaminh-wedding-photo-5.webp',
  'phaminh-wedding-photo-6.webp',
  'phaminh-wedding-photo-7.webp',
  'phaminh-wedding-photo-8.webp',
  'phaminh-wedding-photo-9.webp',
  'phaminh-wedding-photo-10.webp',
  'phaminh-wedding-photo-11.webp',
  'phaminh-wedding-photo-12.webp',
  'phaminh-wedding-photo-13.webp',
  'phaminh-wedding-photo-14.webp',
  'phaminh-wedding-photo-15.webp',
  'phaminh-wedding-photo-16.webp',
  'phaminh-wedding-photo-17.webp',
  'phaminh-wedding-photo-18.webp',
  'phaminh-wedding-photo-19.webp',
  'phaminh-wedding-photo-20.webp',
  'phaminh-wedding-photo-21.webp',
  'phaminh-wedding-photo-22.webp',
  'phaminh-wedding-photo-23.webp',
  'phaminh-wedding-photo-24.webp',
  'phaminh-wedding-photo.webp',
];

const Wedding = () => {
  return (
    <>
      <SEO
        title={routeMeta['/foto/wedding'].title}
        description={routeMeta['/foto/wedding'].description}
        canonical={routeMeta['/foto/wedding'].canonical}
      />
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, color: '#666', margin: '0 0 1.25rem', maxWidth: 520 }}>
        Timeless wedding photographs from the Bay Area and Arkansas — candid, cinematic, and crafted to last a lifetime.{' '}
        <Link to="/contact" style={{ color: '#333' }}>Book a session</Link> or <Link to="/pricing" style={{ color: '#333' }}>view packages</Link>.
      </p>
      <Gallery images={images} basePath="/assets/foto/wedding" />
    </>
  );
};

export default Wedding;