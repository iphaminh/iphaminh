// src/components/TestimonialItem/TestimonialItem.js
import React from 'react';
import './TestimonialItem.css'; // Create a CSS file for styling this component

const TestimonialItem = ({ image, text }) => {
  return (
    <div className="testimonial-item">
      <img src={image} alt="Client testimonial" />
      <p>{text}</p>
    </div>
  );
};

export default TestimonialItem;
