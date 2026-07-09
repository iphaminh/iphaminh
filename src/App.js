// App.js
import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import CustomNavbar from './components/Navbar/Navbar';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Route-based code splitting — each page loads its JS only when visited.
// LandingPage stays eager so the homepage renders without a second request.
const CineGallery = lazy(() => import('./pages/CineGallery/CineGallery'));
const Testimonials = lazy(() => import('./pages/Testimonials/Testimonials'));
const Pricing = lazy(() => import('./pages/PricingPage/Pricing'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const Foto = lazy(() => import('./pages/Foto/Foto'));
const Wedding = lazy(() => import('./pages/Foto/Wedding'));
const Engagement = lazy(() => import('./pages/Foto/Engagement'));
const Portrait = lazy(() => import('./pages/Foto/Portrait'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const FilmPage = lazy(() => import('./pages/FilmPage/FilmPage'));
const Blog = lazy(() => import('./pages/Blog/Blog'));
const BlogPost = lazy(() => import('./pages/Blog/BlogPost'));
const LocationPage = lazy(() => import('./pages/LocationPage/LocationPage'));

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <CustomNavbar />
      <Suspense fallback={null}>
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

          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          <Route path="/wedding-videographer" element={<LocationPage />} />
          <Route path="/wedding-videographer/:slug" element={<LocationPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
