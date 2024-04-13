// pages/Engagement.js
import React from 'react';
import Gallery from '../../components/Foto/Gallery'; 

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
    // Create a copy of the images array and shuffle it
    const shuffledImages = [...images];
    shuffleArray(shuffledImages);
  
    return <Gallery images={shuffledImages} basePath="/assets/foto/engagement" />;
  };
  
  export default Engagement;