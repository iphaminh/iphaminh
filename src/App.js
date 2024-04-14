// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import CineGallery from './pages/CineGallery/CineGallery';
import CustomNavbar from './components/Navbar/Navbar';
import Testimonials from './pages/Testimonials/Testimonials';
import Pricing from './pages/PricingPage/Pricing';
import Contact from './pages/Contact/Contact';
import Foto from './pages/Foto/Foto'; // Import your Foto component
import Wedding from './pages/Foto/Wedding'; // Import your Wedding component
import Engagement from './pages/Foto/Engagement'; // Import your Engagement component
import Portrait from './pages/Foto/Portrait';
// Import other categories as needed...

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
        {/* Foto route with nested routes for categories */}
        <Route path="/foto" element={<Foto />}>
          <Route index element={<Wedding />} />
          <Route path="wedding" element={<Wedding />} />
          <Route path="engagement" element={<Engagement />} />
          <Route path="portrait" element={<Portrait />} />
          {/* Define other categories here */}
        </Route>
        {/* Define other routes as needed */}
      </Routes>
    </>
  );
}

export default App;
