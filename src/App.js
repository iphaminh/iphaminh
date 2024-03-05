import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import CineGallery from './pages/CineGallery/CineGallery';
import CustomNavbar from './components/Navbar/Navbar';
import Testimonials from './pages/Testimonials/Testimonials';
import Pricing from './pages/PricingPage/Pricing';
import Contact from './pages/Contact/Contact';

function App() {
  return (
    <>
      <CustomNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cine" element={<CineGallery />} />
        <Route path="/testimonial" element={<Testimonials />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        {/* Define other routes as needed */}
      </Routes>
    </>
  );
}

export default App;
