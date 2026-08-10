// src/components/FAQs/FAQs.js

import React from 'react';
import './FAQs.css'; // Your CSS file for styling

const FAQs = () => {
    const faqs = [
    {
      question: 'How much does a wedding videographer cost in Napa Valley and the Bay Area?',
      answer: 'Most couples in Napa Valley, the Bay Area, and Sacramento invest $2,700-$8,000 in their wedding film. Full-day cinematic coverage starts at $2,700; elopement films start at $2,500. There are no travel fees anywhere in Solano, Napa, or Sacramento counties.',
    },

    {
      question: 'How much does a wedding videographer cost in Northwest Arkansas?',
      answer: 'Wedding films in Northwest Arkansas, Eureka Springs, Hot Springs, and Little Rock start at $2,700 for full-day cinematic coverage, with elopement films from $2,500.',
    },

    {
      question: 'What is the turnaround time?',
      answer: 'According to my contract, the production and distribution of all wedding and elopement videos will span 6-8 weeks. Frequently, I share highlights and sneak peeks on my social media platforms, so stay tuned for glimpses of your special day',
    },

    {
      question: 'Do you offer discounts?',
      answer: 'Yes! I give a 10% discount on the package price to both my returning clients and military members...',
    },

    {
      question: 'Does the deposit come out of the package price?',
      answer: 'Yes! The 30% deposit is part of your package price, it is not an additional cost. However, it is non-refundable in order to hold your date.',
    },

    {
      question: 'Can I choose my music?',
      answer: 'I typically select music that complements your film is mood, ensuring all tracks are properly licensed from reputable sources like Artlist, Musicbed, or Audio Jungle. Licensing is crucial to avoid legal issues and content takedowns. Artlist tracks are included at no extra cost due to my annual subscription. If you prefer to pick your own song from Musicbed or Audio Jungle, note that it will incur an additional fee of $25-50 per song. Please express your preference for selecting music before signing the contract, and feel free to discuss any questions during the booking process.',
    },

    {
      question: 'Does drone footage cost extra?',
      answer: 'Absolutely not, I can capture stunning aerial footage for your wedding film. However, it is essential to confirm with your venue coordinator that drone flights are permitted at your event location. While I prioritize public safety and will not operate the drone in poor weather conditions, under favorable circumstances, we are all set to take to the skies!',
    },
 
    {
      question: 'Do you travel for films?',
      answer: 'Absolutely! I\'m based in Vacaville, California — between Napa Valley and Sacramento — and there are no travel fees anywhere in Solano, Napa, Yolo, or Sacramento counties. I also return to Arkansas every year and travel nationwide for weddings and elopements; for out-of-area packages and estimated travel costs, just reach out.',
    },

    {
      question: 'How do I download my video?',
      answer: 'I provide all my clients with a Google Drive link to their final video edit. Additionally, you can access your video through my Vimeo webpage and download it directly. For convenient mobile access and sharing, download the Vimeo app on your phone and save your wedding video straight to your device.',
    },

    {
      question: 'How long have you been filming weddings?',
      answer: 'I have been capturing the essence of weddings through film since 2015, after graduating with a degree in Filmmaking from UCA. My work has not only earned me the Best Cinematography award in Conway, AR, but it has also been featured in numerous industry-leading wedding pages',
    },

    {
      question: 'When should I reach out to book?',
      answer: 'Reach out as soon as you can – it is always the right time to get your wedding date on my calendar! I limit my bookings to 20-25 weddings annually to ensure each film gets the time and devotion it deserves, from planning and filming to editing. I often start booking 1-2 years ahead, with weekend dates (especially Saturdays) during the summer and fall filling up the fastest. Looking forward to creating something beautiful with you',
    },

    {
      question: 'Are taxes included?',
      answer: 'Arkansas State and Georgia State Sales Tax is 7% of your total package price. This amount will be added to your client invoice in compliance with Arkansas State Law.',
    },
  ];

  const halfwayIndex = Math.ceil(faqs.length / 2);
  const firstColumnFaqs = faqs.slice(0, halfwayIndex);
  const secondColumnFaqs = faqs.slice(halfwayIndex);

  return (
    <section className="faqs-section">
      <p className="faqs-eyebrow">Good to Know</p>
      <h2 className="faqs-heading">Questions, Answered</h2>
      <div className="faqs-rule" aria-hidden="true" />
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
    </section>
  );
};

export default FAQs;