// src/pages/PricingPage/Pricing.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css'; // Make sure the path to your CSS file is correct
import FAQs from '../../components/FAQs/FAQs';
import InstagramFeed from '../../components/InstagramFeed/InstagramFeed';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import SEO from '../../components/SEO/SEO';
import { routeMeta } from '../../data/routeMeta';

export default function Pricing() {
  return (
 <div className="container mx-auto px-4">
   <SEO
     title={routeMeta['/pricing'].title}
     description={routeMeta['/pricing'].description}
        canonical={routeMeta['/pricing'].canonical}
   />
   {/* Hero section with headline */}
   <section className="text-center py-12">
        <div className="responsive-img-wrapper">
          <img src="/assets/pricing/elegant-wedding-table-setting-georgia-phaminh.png" alt="Elegant wedding table setting filmed by Phaminh Cinematography" />
        </div>
        <p className="pricing-eyebrow">Investment</p>
        <h1 className="hero-title">
            Preserving Life's Priceless Moments <br /> Through The Art Of Film
          </h1>
          <div className="pricing-rule" aria-hidden="true" />
          <p className="hero-text">
            Thirty years from now, you'll be able to watch your father walk you
            down the aisle — hear his voice, your vows, your grandpa on the dance
            floor. That's what a wedding film is for. Every package below is
            full-day, story-first coverage; wherever you celebrate between Napa
            Valley and Sacramento, there's never a travel fee.
          </p>

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
        <p className="packages-note">
          Every film is delivered within 6–8 weeks. One wedding per day, 20–25
          weddings per year — so each film gets the devotion it deserves.{' '}
          <Link to="/contact">Ask for the full pricing guide</Link>.
        </p>
         {/* New Section Below Packages */}
      <section className="call-to-action-section">
        <img src="/assets/pricing/georgia-wedding-couple-portraits-phaminh.png" alt="Wedding couple portraits by Phaminh Cinematography" className="w-full" />
        <div className="cta-content">
          <h2 className="cta-heading">LET'S DO THIS THING!</h2>
          <p className="cta-text">INQUIRE ABOUT YOUR WEDDING DATE</p>
          <Link className="cta-button" to="/contact">GET IN TOUCH</Link>
        </div>
      </section>

      <FAQs />
      <InstagramFeed />
      <FooterShowcase />
      </div>
    
  );
}
