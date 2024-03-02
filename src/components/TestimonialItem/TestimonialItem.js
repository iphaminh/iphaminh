// src/components/TestimonialItem/TestimonialItem.js
import React from 'react';

const TestimonialItem = ({ image, text }) => {
  return (
    <div className="testimonial-item">
      <img src={image} alt="Client testimonial" />
      <p>{text}</p>
    </div>
  );
};

export default TestimonialItem;
