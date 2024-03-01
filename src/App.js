import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import CineGallery from './pages/CineGallery/CineGallery';
import CustomNavbar from './components/Navbar/Navbar';
import Testimonials from './pages/Testimonials/Testimonials';

function App() {
  return (
    <>
      <CustomNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cine" element={<CineGallery />} />
        <Route path="/testimonial" element={<Testimonials />} />
        {/* Define other routes as needed */}
      </Routes>
    </>
  );
}

export default App;
