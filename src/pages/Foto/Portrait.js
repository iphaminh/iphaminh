// pages/Engagement.js
import React, { useState, useEffect } from 'react';
import Gallery from '../../components/Foto/Gallery'; 

  const images = [
    'phaminh-portrait-photo-4.jpg',
    'phaminh-portrait-photo-7.jpg',
    'phaminh-portrait-photo-8.jpg',
    'phaminh-portrait-photo-9.jpg',
    'phaminh-portrait-photo-10.jpg',
    'phaminh-portrait-photo-12.jpg',
    'phaminh-portrait-photo-13.jpg',
    'phaminh-portrait-photo-14.jpg',
    'phaminh-portrait-photo-24.jpg',
    'phaminh-portrait-photo-27.jpg',
    'phaminh-portrait-photo-29.jpg',
    'phaminh-portrait-photo-16.jpg',
    'phaminh-portrait-photo-19.jpg',
    'phaminh-portrait-photo-37.jpg',
    'phaminh-portrait-photo-38.jpg',
    'phaminh-portrait-photo-39.jpg',
    'phaminh-portrait-photo-40.jpg',
    'phaminh-portrait-photo-41.jpg',
    'phaminh-portrait-photo-35.jpg',
    'phaminh-portrait-photo-42.jpg',
    'phaminh-portrait-photo-44.jpg',
    'phaminh-portrait-photo-34.jpg',
    'phaminh-portrait-photo-45.jpg',
    'phaminh-portrait-photo-46.jpg',
    'phaminh-portrait-photo-48.jpg',
    'phaminh-portrait-photo-49.jpg',
    'phaminh-portrait-photo-50.jpg',
    'phaminh-portrait-photo-51.jpg',
    'phaminh-portrait-photo-52.jpg',
    'phaminh-portrait-photo-3.jpg',
    'phaminh-portrait-photo-53.jpg',
    'phaminh-portrait-photo-54.jpg',
    'phaminh-portrait-photo-55.jpg',
    'phaminh-portrait-photo-56.jpg',
    'phaminh-portrait-photo-57.jpg',
    'phaminh-portrait-photo-58.jpg',
    'phaminh-portrait-photo-59.jpg',
    'phaminh-portrait-photo-60.jpg',
    'phaminh-portrait-photo-61.jpg',
    'phaminh-portrait-photo-62.jpg',
    'phaminh-portrait-photo.jpg',
  ];

  const Portrait = () => {
    return <Gallery images={images} basePath="/assets/foto/portrait" />;
  };

  
  export default Portrait;