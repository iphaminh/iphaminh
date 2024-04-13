// components/Gallery.js
import React from 'react';
import './Gallery.css'; // Make sure this CSS file has the styles for your gallery


const Gallery = ({ images, basePath }) => {

    return (
        <div className="wedding-gallery">
          {images.map((image, index) => {
            // Determine the class name based on the index or specific condition
            let className = 'wedding-photo';
            if (index % 5 === 0) { // Example condition
              className += ' large-landscape';
            } else if (index % 6 === 0) { // Another condition for a different size
              className += ' large-portrait';
            }
    
            return (
                <div key={index} className={className}>
                <img src={`${basePath}/${image}`} alt={`Gallery item ${index}`} />
              </div>
            );
          })}
        </div>
      );
    };

export default Gallery;
