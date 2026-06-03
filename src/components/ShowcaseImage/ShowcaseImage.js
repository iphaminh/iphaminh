import React from 'react';
import './ShowcaseImage.css'; // Make sure the path to the CSS file is correct

const ShowcaseImage = () => {
  return (
    <div className="showcase-image-container">
      <img
        src="/assets/images/weddingvideographer-near-me.webp"
        alt="Bay Area and Arkansas wedding videographer near me"
        width="2400"
        height="1349"
        loading="lazy"
      />
    </div>
  );
};

export default ShowcaseImage;
