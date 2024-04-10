// pages/Wedding.js
import React from 'react';
import './Wedding.css'; // Make sure this CSS file exists and is correctly imported

const Wedding = () => {
  const imageNames = [
    'phaminh-wedding-photo-2.jpg',
    'phaminh-wedding-photo-3.jpg',
    'phaminh-wedding-photo-4.jpg',
    'phaminh-wedding-photo-5.jpg',
    'phaminh-wedding-photo-6.jpg',
    'phaminh-wedding-photo-7.jpg',
    'phaminh-wedding-photo-8.jpg',
    'phaminh-wedding-photo-9.jpg',
    'phaminh-wedding-photo-10.jpg',
    'phaminh-wedding-photo-11.jpg',
    'phaminh-wedding-photo-12.jpg',
    'phaminh-wedding-photo-13.jpg',
    'phaminh-wedding-photo-14.jpg',
    'phaminh-wedding-photo-15.jpg',
    'phaminh-wedding-photo-16.jpg',
    'phaminh-wedding-photo-17.jpg',
    'phaminh-wedding-photo-18.jpg',
    'phaminh-wedding-photo-19.jpg',
    'phaminh-wedding-photo-20.jpg',
    'phaminh-wedding-photo-21.jpg',
    'phaminh-wedding-photo-22.jpg',
    'phaminh-wedding-photo-23.jpg',
    'phaminh-wedding-photo-24.jpg',
    'phaminh-wedding-photo.jpg',
  ];

  return (
    <div className="wedding-gallery">
      {imageNames.map((name, index) => (
        <img key={index} src={`${process.env.PUBLIC_URL}/assets/foto/wedding/${name}`} alt={`Wedding ${index + 1}`} />
      ))}
    </div>
  );
};

export default Wedding;
