// pages/Portrait.js
import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../../components/Foto/Gallery';
import SEO from '../../components/SEO/SEO';
import { routeMeta } from '../../data/routeMeta';

  const images = [
    'phaminh-portrait-photo-4.webp',
    'phaminh-portrait-photo-7.webp',
    'phaminh-portrait-photo-8.webp',
    'phaminh-portrait-photo-9.webp',
    'phaminh-portrait-photo-10.webp',
    'phaminh-portrait-photo-12.webp',
    'phaminh-portrait-photo-13.webp',
    'phaminh-portrait-photo-14.webp',
    'phaminh-portrait-photo-27.webp',
    'phaminh-portrait-photo-29.webp',
    'phaminh-portrait-photo-16.webp',
    'phaminh-portrait-photo-19.webp',
    'phaminh-portrait-photo-37.webp',
    'phaminh-portrait-photo-38.webp',
    'phaminh-portrait-photo-39.webp',
    'phaminh-portrait-photo-40.webp',
    'phaminh-portrait-photo-41.webp',
    'phaminh-portrait-photo-35.webp',
    'phaminh-portrait-photo-42.webp',
    'phaminh-portrait-photo-44.webp',
    'phaminh-portrait-photo-34.webp',
    'phaminh-portrait-photo-45.webp',
    'phaminh-portrait-photo-46.webp',
    'phaminh-portrait-photo-48.webp',
    'phaminh-portrait-photo-49.webp',
    'phaminh-portrait-photo-50.webp',
    'phaminh-portrait-photo-51.webp',
    'phaminh-portrait-photo-52.webp',
    'phaminh-portrait-photo-3.webp',
    'phaminh-portrait-photo-53.webp',
    'phaminh-portrait-photo-54.webp',
    'phaminh-portrait-photo-55.webp',
    'phaminh-portrait-photo-56.webp',
    'phaminh-portrait-photo-57.webp',
    'phaminh-portrait-photo-58.webp',
    'phaminh-portrait-photo-59.webp',
    'phaminh-portrait-photo-60.webp',
    'phaminh-portrait-photo-61.webp',
    'phaminh-portrait-photo-62.webp',
    'phaminh-portrait-photo.webp',
  ];

  const Portrait = () => {
    return (
      <>
        <SEO
          title={routeMeta['/foto/portrait'].title}
          description={routeMeta['/foto/portrait'].description}
        canonical={routeMeta['/foto/portrait'].canonical}
        />
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, color: '#666', margin: '0 0 1.25rem', maxWidth: 520 }}>
          Portrait and lifestyle sessions for individuals, couples, and brands — editorial, creative, and authentically you.{' '}
          <Link to="/contact" style={{ color: '#333' }}>Book a session</Link> or <Link to="/pricing" style={{ color: '#333' }}>view packages</Link>.
        </p>
        <Gallery images={images} basePath="/assets/foto/portrait" />
      </>
    );
  };

  
  export default Portrait;