// src/pages/PricingPage/Pricing.js
import React from 'react';
import './Pricing.css'; // Make sure the path to your CSS file is correct
import FAQs from '../../components/FAQs/FAQs';

export default function Pricing() {
  return (
 <div className="container mx-auto px-4">
   {/* Hero section with headline */}
   <section className="text-center py-12">
        <div className="responsive-img-wrapper">
          <img src="/assets/pricing/elegant-wedding-table-setting-georgia-phaminh.png" alt="Elegant Wedding Table Setting" />
        </div>
        <h1 className="hero-title">
            Preserving Life's Priceless Moments <br /> Through The Art Of Film
          </h1>   
          <p className="hero-text">VIDEO PRODUCTION IS A UNIQUE WAY TO REPLAY SPECIAL MOMENTS IN OUR LIVES. WHETHER IT BE THE CEREMONIAL KISS UNDER THE ARBOR FOR THE FIRST TIME AS HUSBAND
AND WIFE; YOUR SWEET GRANDPA ROCKING OUT ON THE DANCE FLOOR; A NEWBORN CHILD BEING BROUGHT INTO THIS WORLD; ONCE IN A LIFETIME MEMORIES AND ADVENTURES
ARE ABLE TO BE RELIVED THROUGH THE ESSENCE OF FILM. JUST PICTURE THIRTY YEARS FROM NOW, HAVING THE ABILITY TO GO BACK AND RELIVE YOUR FATHER WALKING YOU
DOWN THE AISLE ON YOUR WEDDING DAY OR THE FIRST TIME SEEING YOUR LOVED ONE COMING HOME TO YOU, AFTER YEARS OF BEING APART.</p>

  </section>

        {/* Packages */}
        <div className="packages">
      {/* Package I */}
          <div className="package">
        <h2 className="package-title">Elopement Videography Packages</h2>
        <p className="package-description">Intimate Elopement Packages for the Adventurous Couple. Ready to break away from tradition and begin your journey together in a breathtaking, dream location? This package is crafted for you!</p>
        <p className="package-price">Starting at $2,500</p>         
          </div>

          {/* Package II */}
          <div className="package">
        <h2 className="package-title">Wedding Videography Packages</h2>
        <p className="package-description">Wedding Packages Tailored for Every Bride, from the Minimalist to the Extravagant. Our custom options ensure every precious moment, from dawn till dusk, is captured beautifully on your special day.</p>
        <p className="package-price">Starting at $2,700</p>
          </div>

          {/* Package III */}
          <div className="package">
        <h2 className="package-title">First Look Videography Packages</h2>
        <p className="package-description">Embark on a Romantic Adventure with Your Love, either before or after your wedding. Seize the chance to dress up and explore a stunning locale for an intimate first look, vow renewal, or a serene escapade, just for the two of you.</p>
        <p className="package-price">Starting at $500</p>
          </div>
        </div>
         {/* New Section Below Packages */}
      <section className="call-to-action-section">
        <img src="/assets/pricing/georgia-wedding-couple-portraits-phaminh.png" alt="Georgia Wedding Couple" className="w-full" />
        <div className="cta-content">
          <h2 className="cta-heading">LET'S DO THIS THING!</h2>
          <p className="cta-text">INQUIRE ABOUT YOUR WEDDING DATE</p>
          <button className="cta-button">GET IN TOUCH</button>
        </div>
      </section>

      <FAQs />

      </div>
    
  );
}
