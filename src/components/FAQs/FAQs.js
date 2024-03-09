// src/components/FAQs/FAQs.js

import React from 'react';
import './FAQs.css'; // Your CSS file for styling

const FAQs = () => {
    const faqs = [
    {
      question: '• WHAT IS THE TURN AROUND TIME?',
      answer: 'According to my contract, the production and distribution of all wedding and elopement videos will span 6-8 weeks. Frequently, I share highlights and sneak peeks on my social media platforms, so stay tuned for glimpses of your special day',
    },

    {
      question: '• DO YOU OFFER DISCOUNTS?',
      answer: 'Yes! I give a 10% discount on the package price to both my returning clients and military members...',
    },

    {
      question: '• DOES THE DEPOSIT COME OUT OF THE PACKAGE PRICE?',
      answer: 'Yes! The 30% deposit is part of your package price, it is not an additional cost. However, it is non-refundable in order to hold your date.',
    },

    {
      question: '• CAN I CHOOSE MY MUSIC?',
      answer: 'I typically select music that complements your film is mood, ensuring all tracks are properly licensed from reputable sources like Artlist, Musicbed, or Audio Jungle. Licensing is crucial to avoid legal issues and content takedowns. Artlist tracks are included at no extra cost due to my annual subscription. If you prefer to pick your own song from Musicbed or Audio Jungle, note that it will incur an additional fee of $25-50 per song. Please express your preference for selecting music before signing the contract, and feel free to discuss any questions during the booking process.',
    },

    {
      question: '• DOES DRONE FOOTAGE COST EXTRA?',
      answer: 'Absolutely not, I can capture stunning aerial footage for your wedding film. However, it is essential to confirm with your venue coordinator that drone flights are permitted at your event location. While I prioritize public safety and will not operate the drone in poor weather conditions, under favorable circumstances, we are all set to take to the skies!',
    },
 
    {
      question: '• DO YOU TRAVEL FOR FILMS?',
      answer: 'Absolutely! While I am based in Arkansas and Georgia, I frequently travel nationwide for weddings and elopements. For information on my out-of-state packages, including estimated travel costs, please feel free to reach out to me',
    },

    {
      question: '• HOW DO I DOWNLOAD MY VIDEO?',
      answer: 'I provide all my clients with a Google Drive link to their final video edit. Additionally, you can access your video through my Vimeo webpage and download it directly. For convenient mobile access and sharing, download the Vimeo app on your phone and save your wedding video straight to your device.',
    },

    {
      question: '• HOW LONG HAVE YOU BEEN FILMING WEDDINGS?',
      answer: 'I have been capturing the essence of weddings through film since 2015, after graduating with a degree in Filmmaking from UCA. My work has not only earned me the Best Cinematography award in Conway, AR, but it has also been featured in numerous industry-leading wedding pages',
    },

    {
      question: '• WHEN SHOULD I REACH OUT TO BOOK?',
      answer: 'Reach out as soon as you can – it is always the right time to get your wedding date on my calendar! I limit my bookings to 20-25 weddings annually to ensure each film gets the time and devotion it deserves, from planning and filming to editing. I often start booking 1-2 years ahead, with weekend dates (especially Saturdays) during the summer and fall filling up the fastest. Looking forward to creating something beautiful with you',
    },

    {
      question: '• ARE TAXES INCLUDED?',
      answer: 'Arkansas State and Georgia State Sales Tax is 7% of your total package price. This amount will be added to your client invoice in compliance with Arkansas State Law.',
    },
  ];

  const halfwayIndex = Math.ceil(faqs.length / 2);
  const firstColumnFaqs = faqs.slice(0, halfwayIndex);
  const secondColumnFaqs = faqs.slice(halfwayIndex);

  return (
    <div className="faqs-container">
      <div className="faqs-column">
        {firstColumnFaqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
      <div className="faqs-divider"></div> {/* This is the vertical line */}
      <div className="faqs-column">
        {secondColumnFaqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;