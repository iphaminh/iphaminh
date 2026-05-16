// App.js
import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import CineGallery from './pages/CineGallery/CineGallery';
import CustomNavbar from './components/Navbar/Navbar';
import Testimonials from './pages/Testimonials/Testimonials';
import Pricing from './pages/PricingPage/Pricing';
import Contact from './pages/Contact/Contact';
import Foto from './pages/Foto/Foto';
import Wedding from './pages/Foto/Wedding';
import Engagement from './pages/Foto/Engagement';
import Portrait from './pages/Foto/Portrait';
import NotFound from './pages/NotFound/NotFound';
import FilmPage from './pages/FilmPage/FilmPage';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <CustomNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cine" element={<CineGallery />} />
        <Route path="/cine/:slug" element={<FilmPage />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/testimonial" element={<Navigate to="/testimonials" replace />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />

        {/* Foto route with nested routes for categories */}
        <Route path="/foto" element={<Foto />}>
          <Route index element={<Wedding />} />
          <Route path="wedding" element={<Wedding />} />
          <Route path="engagement" element={<Engagement />} />
          <Route path="portrait" element={<Portrait />} />
          <Route path="couples" element={<Navigate to="/foto/engagement" replace />} />
          <Route path="portraits" element={<Navigate to="/foto/portrait" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
