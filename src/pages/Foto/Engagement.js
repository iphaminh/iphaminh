// pages/Engagement.js
import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../../components/Foto/Gallery';
import SEO from '../../components/SEO/SEO';

  const images = [
    'phaminh-engagement-photo-2.jpg',
    'phaminh-engagement-photo-3.jpg',
    'phaminh-engagement-photo-6.jpg',
    'phaminh-engagement-photo-7.jpg',
    'phaminh-engagement-photo-8.jpg',
    'phaminh-engagement-photo-9.jpg',
    'phaminh-engagement-photo-10.jpg',
    'phaminh-engagement-photo-12.jpg',
    'phaminh-engagement-photo-13.jpg',
    'phaminh-engagement-photo-14.jpg',
    'phaminh-engagement-photo-17.jpg',
    'phaminh-engagement-photo-18.jpg',
    'phaminh-engagement-photo-20.jpg',
    'phaminh-engagement-photo-23.jpg',
    'phaminh-engagement-photo-24.jpg',
    'phaminh-engagement-photo-25.jpg',
    'phaminh-engagement-photo-26.jpg',
    'phaminh-engagement-photo-27.jpg',
    'phaminh-engagement-photo-28.jpg',
    'phaminh-engagement-photo-29.jpg',
    'phaminh-engagement-photo-30.jpg',
    'phaminh-engagement-photo-31.jpg',
    'phaminh-engagement-photo-32.jpg',
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
          title="Engagement Photography | San Francisco Bay Area & NW Arkansas | Phaminh"
          description="Engagement sessions in San Francisco, Oakland, Napa, Fayetteville AR, Bentonville AR, and Rogers AR — candid, romantic, and uniquely yours."
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