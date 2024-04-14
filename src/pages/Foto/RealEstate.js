// pages/Portrait.js
import React from 'react';
import Gallery from '../../components/Foto/Gallery'; 

  const images = [
    'phaminh-realestate-photo-4.jpg',
    'phaminh-realestate-photo-7.jpg',
    'phaminh-realestate-photo-8.jpg',
    'phaminh-realestate-photo-9.jpg',
    'phaminh-realestate-photo-10.jpg',
    'phaminh-realestate-photo-12.jpg',
    'phaminh-realestate-photo-13.jpg',
    'phaminh-realestate-photo-14.jpg',
    'phaminh-realestate-photo-27.jpg',
    'phaminh-realestate-photo-29.jpg',
    'phaminh-realestate-photo-16.jpg',
    'phaminh-realestate-photo-19.jpg',
    'phaminh-realestate-photo-37.jpg',
    'phaminh-realestate-photo-38.jpg',
    'phaminh-realestate-photo-39.jpg',
    'phaminh-realestate-photo-40.jpg',
    'phaminh-realestate-photo-41.jpg',
    'phaminh-realestate-photo-35.jpg',
    'phaminh-realestate-photo-42.jpg',
    'phaminh-realestate-photo-44.jpg',
    'phaminh-realestate-photo-34.jpg',
    'phaminh-realestate-photo-45.jpg',
    'phaminh-realestate-photo-46.jpg',
    'phaminh-realestate-photo-48.jpg',
    'phaminh-realestate-photo-49.jpg',
    'phaminh-realestate-photo-50.jpg',
    'phaminh-realestate-photo-51.jpg',
    'phaminh-realestate-photo-52.jpg',
    'phaminh-realestate-photo-3.jpg',
    'phaminh-realestate-photo-53.jpg',
    'phaminh-realestate-photo-54.jpg',
    'phaminh-realestate-photo-55.jpg',
    'phaminh-realestate-photo-56.jpg',
    'phaminh-realestate-photo-57.jpg',
    'phaminh-realestate-photo-58.jpg',
    'phaminh-realestate-photo-59.jpg',
    'phaminh-realestate-photo-60.jpg',
    'phaminh-realestate-photo-61.jpg',
    'phaminh-realestate-photo-62.jpg',
    'phaminh-realestate-photo.jpg',
  ];

  const RealEstate = () => {
    return <Gallery images={images} basePath="/assets/foto/realestate" />;
  };

  
  export default RealEstate;