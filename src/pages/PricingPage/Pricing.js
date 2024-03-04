// src/pages/PricingPage/Pricing.js
import React from 'react';
import './Pricing.css'; // Make sure the path to your CSS file is correct

export default function Pricing() {
  return (
    <div>
  
      
      <main className="container mx-auto px-4">
        {/* Hero section with headline */}
        <section className="text-center py-12">
  <div className="responsive-img-wrapper">
    <img src="/assets/pricing/elegant-wedding-table-setting-georgia-phaminh.png" alt="Elegant Wedding Table Setting" />
  </div>
</section>


        
        {/* Pricing Info */}
        <div className="text-center py-12 px-4">
    <h1 className="text-4xl mb-4 font-montserrat">Preserving Life's Priceless Moments Through The Art Of Film</h1>
    <p className="mb-8 font-montserrat" style={{ fontSize: '12px' }}>VIDEO PRODUCTION IS A UNIQUE WAY TO REPLAY SPECIAL MOMENTS IN OUR LIVES. WHETHER IT BE THE CEREMONIAL KISS UNDER THE ARBOR FOR THE FIRST TIME AS HUSBAND
AND WIFE; YOUR SWEET GRANDPA ROCKING OUT ON THE DANCE FLOOR; A NEWBORN CHILD BEING BROUGHT INTO THIS WORLD; ONCE IN A LIFETIME MEMORIES AND ADVENTURES
ARE ABLE TO BE RELIVED THROUGH THE ESSENCE OF FILM. JUST PICTURE THIRTY YEARS FROM NOW, HAVING THE ABILITY TO GO BACK AND RELIVE YOUR FATHER WALKING YOU
DOWN THE AISLE ON YOUR WEDDING DAY OR THE FIRST TIME SEEING YOUR LOVED ONE COMING HOME TO YOU, AFTER YEARS OF BEING APART.</p>
        
        {/* Packages */}
        <div className="flex flex-col md:flex-row justify-around items-start md:items-center my-12 mx-auto">
      {/* Package I */}
      <div className="package-info text-center mx-4 mb-8 md:mb-0">
        <h2 className="font-montserrat">Elopement Videography Packages</h2>
        <p className="font-crimson">Intimate Elopement Packages for the Adventurous Couple. Ready to break away from tradition and begin your journey together in a breathtaking, dream location? This package is crafted for you!</p>
        <p className="package-price">Starting at $2,500</p>          </div>

          {/* Package II */}
          <div className="package-info text-center mx-4 mb-8 md:mb-0">
          <h2 className="font-montserrat">Wedding Videography Packages</h2>
          <p className="font-crimson">Wedding Packages Tailored for Every Bride, from the Minimalist to the Extravagant. Our custom options ensure every precious moment, from dawn till dusk, is captured beautifully on your special day.</p>
            <p className="package-price">Starting at $3,000</p>
          </div>

          {/* Package III */}
          <div className="package-info text-center mx-4 mb-8 md:mb-0">
          <h2 className="font-montserrat">First Look Videography Packages</h2>
          <p className="font-crimson">Embark on a Romantic Adventure with Your Love, either before or after your wedding. Seize the chance to dress up and explore a stunning locale for an intimate first look, vow renewal, or a serene escapade, just for the two of you.</p>
            <p className="package-price">Starting at $500</p>
          </div>
        </div>
      </div>
          
          {/* Pricing option 2 */}
          {/* ... similar structure for other pricing options */}
      </main>
      
    </div>
  );
}
