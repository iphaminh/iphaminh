// pages/Engagement.js
import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../../components/Foto/Gallery';
import SEO from '../../components/SEO/SEO';
import { routeMeta } from '../../data/routeMeta';

  const images = [
    'phaminh-engagement-photo-2.webp',
    'phaminh-engagement-photo-3.webp',
    'phaminh-engagement-photo-6.webp',
    'phaminh-engagement-photo-7.webp',
    'phaminh-engagement-photo-8.webp',
    'phaminh-engagement-photo-9.webp',
    'phaminh-engagement-photo-10.webp',
    'phaminh-engagement-photo-12.webp',
    'phaminh-engagement-photo-13.webp',
    'phaminh-engagement-photo-14.webp',
    'phaminh-engagement-photo-17.webp',
    'phaminh-engagement-photo-18.webp',
    'phaminh-engagement-photo-20.webp',
    'phaminh-engagement-photo-23.webp',
    'phaminh-engagement-photo-24.webp',
    'phaminh-engagement-photo-25.webp',
    'phaminh-engagement-photo-26.webp',
    'phaminh-engagement-photo-27.webp',
    'phaminh-engagement-photo-28.webp',
    'phaminh-engagement-photo-29.webp',
    'phaminh-engagement-photo-30.webp',
    'phaminh-engagement-photo-31.webp',
    'phaminh-engagement-photo-32.webp',
  ];

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  const Engagement = () => {
    const shuffledImages = [...images];
    shuffleArray(shuffledImages);

    return (
      <>
        <SEO
          title={routeMeta['/foto/engagement'].title}
          description={routeMeta['/foto/engagement'].description}
        canonical={routeMeta['/foto/engagement'].canonical}
        />
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, color: '#666', margin: '0 0 1.25rem', maxWidth: 520 }}>
          Romantic engagement sessions across the Bay Area and Arkansas — relaxed, candid, and full of real connection.{' '}
          <Link to="/contact" style={{ color: '#333' }}>Book a session</Link> or <Link to="/pricing" style={{ color: '#333' }}>view packages</Link>.
        </p>
        <Gallery images={shuffledImages} basePath="/assets/foto/engagement" />
      </>
    );
  };
  
  export default Engagement;