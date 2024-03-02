// src/components/TestimonialItem/FullScreenImage.js
import React from 'react';

const FullScreenImage = ({ src, alt }) => {
  return (
    <div className="full-screen-image-container">
      <img src={src} alt={alt} className="full-screen-image" />
    </div>
  );
};

export default FullScreenImage;
