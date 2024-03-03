// src/components/TestimonialItem/TestimonialItem.js
import React from 'react';

const TestimonialItem = ({ image, text, isReversed }) => {
    const itemClass = isReversed ? "testimonial-item testimonial-item-reverse" : "testimonial-item";
    return (
      <div className={itemClass}>
        <img src={image} alt="Client testimonial" />
        <p>{text}</p>
      </div>
    );
  };
  

export default TestimonialItem;
