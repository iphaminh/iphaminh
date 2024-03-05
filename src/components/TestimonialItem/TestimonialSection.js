// src/components/TestimonialSection/TestimonialSection.js
import React from 'react';
import TestimonialItem from '../TestimonialItem/TestimonialItem';
import '../../pages/Testimonials/Testimonials.css';

const TestimonialSection = () => {
  // This array should eventually be replaced with data fetched from a server or a static data file
  const testimonials = [
    {
      image: '/assets/testimonials/arkansas-bride-portrait-phaminh.png',
      text: 'We finally watched our wedding video, and it\'s absolutely mesmerizing! Every scene, every detail was captured with such perfection. Your talent in creating such a heartfelt narrative of our special day is beyond words. The way you made us feel so natural on camera added to the beauty of the experience. A heartfelt thank you for preserving our memories so exquisitely.',
    },
    {
      image: '/assets/testimonials/arkansas-wedding-cake-photography-phaminh.png',
      text: 'Minh!!!!!!!!!!!!!!!!! We cried enough in Jamaica and now you about to make us cry again. Just know that Hollywood aint got nothing on You, in fact, Hollywood needs to snatch you up. You are ANOINTED beyond your years. Do Yah Thang Man I DO',
    },
    {
      image: '/assets/testimonials/georgia-bridal-photoshoot-phaminh.png',
      text: 'Choosing Phaminh Videography was one of the easiest and best decisions of our wedding planning process. The final video is breathtakingly beautiful, capturing every moment with such emotion and clarity. Watching it feels like being transported back to our wedding day, feeling every bit of happiness and love all over again. Your dedication to capturing our day so authentically is evident in every shot. For anyone looking for a videographer who will capture their day flawlessly, Phaminh Videography is the way to go.',
    },
    {
      image: '/assets/testimonials/georgia-wedding-ceremony-videography-phaminh.png',
      text: 'Thank you, Phaminh Videography, for capturing our wedding day so perfectly! Your talent for videography brought our special day to life in a way that photos alone could never achieve. The video is a beautiful narrative of our love, filled with all the laughter, tears, and joy that we experienced. Your professionalism and creativity made you a joy to work with. We are so grateful to have a video that we will cherish for a lifetime. Phaminh Videography is truly the best choice for any couple.',
    },
    {
      image: '/assets/testimonials/georgia-wedding-first-dance-phaminh-video.png',
      text: 'We are absolutely blown away by the wedding video Phaminh Videography created for us! It was like reliving the day all over again, but with even more magic. The attention to detail, the stunning visuals, and the emotional depth you captured were beyond what we hoped for. Your work is not just a video; it is a work of art that tells the story of our love. Thank you for being so incredible at what you do. We recommend Phaminh Videography to anyone wanting a wedding video that is in a league of its own.',
    },
    {
      image: '/assets/testimonials/georgia-wedding-vows-videography-phaminh.png',
      text: 'Thank you from the depths of our hearts for the incredible talent you shared on our wedding day. Watching the footage, we felt the emotions of our vows and the joy of our celebration as vividly as on the day itself. It is clear you put your heart into your work, giving us a treasure that is deeply personal and immensely valuable. Your dedication to preserving our special day has blessed us with the ability to relive these moments, keeping the feelings alive and cherished. Thank you for being an integral part of our journey.',
    },
    {
      image: '/assets/testimonials/phaminh-arkansas-wedding-videography.png',
      text: 'Phaminh Videography turned our wedding memories into a cinematic masterpiece! From the initial consultation to the final delivery, your professionalism and passion for storytelling were evident. The video exceeded our expectations, capturing the joy, elegance, and love of our day in every scene. Your work has given us the gift of reliving our most cherished moments anytime we wish. For anyone wanting a wedding video that stands out, Phaminh Videography is the name to trust.',
    },
    {
      image: '/assets/testimonials/phaminh-candid-wedding-moments-arkansas.png',
      text: 'Your hearts are full of gratitude for Phaminh Videography and the incredible work you did on our wedding video. Every frame speaks volumes of your talent and dedication to capturing the essence of our love. The video is a collection of priceless moments that we will treasure forever. Your ability to blend into the background while capturing the most intimate moments was remarkable. We highly recommend Phaminh Videography to any couple seeking a videographer who can truly capture the spirit of their wedding day.',
    },
    {
      image: '/assets/testimonials/phaminh-georgia-wedding-photography.png',
      text: 'Our wedding day was beautifully encapsulated thanks to Phaminh Videography! The video is a treasure trove of all the special moments, big and small, that made our day unforgettable. Your eye for detail and ability to capture the essence of our love story left us in awe. Watching the video, we are transported back to those moments, feeling all the joy and emotion as if we are there again. Phaminh Videography is truly exceptional, and we wholeheartedly recommend them to anyone wanting to immortalize their wedding day in the most spectacular way!',
    },
    {
      image: '/assets/testimonials/phaminh-romantic-wedding-videography-georgia.png',
      text: 'Choosing Phaminh Videography for our special day was the best decision we ever made! The video of our wedding day is nothing short of a masterpiece. The way you captured the laughter, the tears, and the love was truly magical. Your professionalism and creativity shone through in every shot, making our memories even more beautiful. We cant thank you enough for giving us something so precious to look back on. Anyone in search of a videographer who will exceed all expectations, look no further than Phaminh Videography!',
    },
    {
      image: '/assets/testimonials/phaminh-wedding-photographer-arkansas.png',
      text: 'From the first meeting to the final video, working with Minh was fantastic! His team captured the magic of our wedding day perfectly, from the nervous anticipation to the tearful joy. He put in the extra effort to make sure the video is perfect. The final video is beautifully edited and a joy to watch, and it will be a cherished memory for years to come. They were also professional, friendly, fun and easy to work with throughout the entire process. Thank you for everything!',
    },
    {
      image: '/assets/testimonials/wedding-reception-arkansas-phaminh-videographer.png',
      text: 'Our wedding reception in Arkansas was such a blast, and the video you created lets us relive it over and over! From the attention to detail to the breathtaking quality, you brought our vision to life! We will forever cherish how you were able to capture every emotion felt on our big day! Everything was perfect and we would highly recommend Phaminh Videography to anyone who is looking for someone to blow their expectations out of the water!      ',
    },
    // Add more if there are more testimonials
  ];
  

  return (
    <div className="testimonial-section">
      {testimonials.map((testimonial, index) => (
        <TestimonialItem 
          key={index} 
          image={testimonial.image} 
          text={testimonial.text} 
          isReversed={index % 2 !== 0} // Pass true if index is odd, false if even
        />
      ))}
    </div>
  );
};

export default TestimonialSection;
