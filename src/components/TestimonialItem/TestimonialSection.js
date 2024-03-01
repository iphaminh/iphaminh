// src/components/TestimonialSection/TestimonialSection.js
import React from 'react';
import TestimonialItem from '../TestimonialItem/TestimonialItem';
import './TestimonialSection.css'; // Create a CSS file for styling this component

const TestimonialSection = () => {
  // This array should eventually be replaced with data fetched from a server or a static data file
  const testimonials = [
    {
      image: '/assets/testimonials/arkansas-bride-portrait-phaminh.png',
      text: 'We finally watched our wedding video, and it\'s absolutely mesmerizing! Every scene, every detail was captured with such perfection. Your talent in creating such a heartfelt narrative of our special day is beyond words. The way you made us feel so natural on camera added to the beauty of the experience. A heartfelt thank you for preserving our memories so exquisitely.',
    },
    {
      image: '/assets/testimonials/arkansas-wedding-cake-photography-phaminh.png',
      text: 'Your talent in creating a heartfelt narrative of our special day is beyond words. We are thrilled with the memories you’ve captured.',
    },
    {
      image: '/assets/testimonials/georgia-bridal-photoshoot-phaminh.png',
      text: 'Absolutely stunning work that captures the essence of our special day. We are forever grateful.',
    },
    {
      image: '/assets/testimonials/georgia-wedding-ceremony-videography-phaminh.png',
      text: 'The emotion and joy of our wedding ceremony were captured perfectly. Thank you for your incredible artistry.',
    },
    {
      image: '/assets/testimonials/georgia-wedding-first-dance-phaminh-video.png',
      text: 'Watching our first dance video brings back all the feels. Thank you for such a beautiful memory.',
    },
    {
      image: '/assets/testimonials/georgia-wedding-vows-videography-phaminh.png',
      text: 'You managed to capture every significant moment, especially our vows, with such detail. We can’t thank you enough.',
    },
    {
      image: '/assets/testimonials/phaminh-arkansas-wedding-videography.png',
      text: 'The video you made of our Arkansas wedding is nothing short of a masterpiece. We are in awe.',
    },
    {
      image: '/assets/testimonials/phaminh-candid-wedding-moments-arkansas.png',
      text: 'Your ability to capture candid moments is exceptional. We loved reliving our day through your lens.',
    },
    {
      image: '/assets/testimonials/phaminh-georgia-wedding-photography.png',
      text: 'Your photos brought our Georgia wedding to life again. Your work is truly remarkable.',
    },
    {
      image: '/assets/testimonials/phaminh-romantic-wedding-videography-georgia.png',
      text: 'The romance of our Georgia wedding was captured so eloquently in your videography. We are eternally grateful.',
    },
    {
      image: '/assets/testimonials/phaminh-wedding-photographer-arkansas.png',
      text: 'As our wedding photographer in Arkansas, you were incredible. Thank you for the stunning photos.',
    },
    {
      image: '/assets/testimonials/wedding-reception-arkansas-phaminh-videographer.png',
      text: 'Our wedding reception in Arkansas was a blast, and the video you made lets us relive it over and over.',
    },
    // Add more if there are more testimonials
  ];
  

  return (
    <div className="testimonial-section">
      {testimonials.map((testimonial, index) => (
        <TestimonialItem key={index} image={testimonial.image} text={testimonial.text} />
      ))}
    </div>
  );
};

export default TestimonialSection;
