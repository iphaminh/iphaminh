// App.js
import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import CustomNavbar from './components/Navbar/Navbar';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Route-based code splitting — each page loads its JS only when visited.
// LandingPage stays eager so the homepage renders without a second request.

// Every deploy uploads freshly hashed chunk files and deletes the previous
// ones (SamKirkland/FTP-Deploy-Action syncs the folder). A tab that loaded the
// site before a deploy still runs the old main bundle, so the first click on a
// route it has not visited asks for a chunk that no longer exists, the import
// rejects with a ChunkLoadError, and the ErrorBoundary showed "Something went
// wrong" (2026-09-13, /contact, minutes after the dropdown deploy). Reload the
// page once so the browser fetches the current HTML and bundle; the
// sessionStorage flag stops a reload loop if the chunk is still missing, in
// which case the error reaches the boundary as before.
function lazyWithReload(importer, name) {
  const flag = `chunk-reload:${name}`;
  return lazy(() =>
    importer()
      .then((mod) => {
        try { sessionStorage.removeItem(flag); } catch { /* storage blocked */ }
        return mod;
      })
      .catch((err) => {
        let reloaded = true; // if storage is blocked, never reload (no loop guard)
        try {
          reloaded = sessionStorage.getItem(flag) === '1';
          if (!reloaded) sessionStorage.setItem(flag, '1');
        } catch { /* storage blocked */ }
        if (reloaded) throw err;
        window.location.reload();
        return new Promise(() => {}); // never settles: the page is going away
      })
  );
}

const CineGallery = lazyWithReload(() => import('./pages/CineGallery/CineGallery'), 'CineGallery');
const Testimonials = lazyWithReload(() => import('./pages/Testimonials/Testimonials'), 'Testimonials');
const Pricing = lazyWithReload(() => import('./pages/PricingPage/Pricing'), 'Pricing');
const Contact = lazyWithReload(() => import('./pages/Contact/Contact'), 'Contact');
const Foto = lazyWithReload(() => import('./pages/Foto/Foto'), 'Foto');
const Wedding = lazyWithReload(() => import('./pages/Foto/Wedding'), 'Wedding');
const Engagement = lazyWithReload(() => import('./pages/Foto/Engagement'), 'Engagement');
const Portrait = lazyWithReload(() => import('./pages/Foto/Portrait'), 'Portrait');
const NotFound = lazyWithReload(() => import('./pages/NotFound/NotFound'), 'NotFound');
const FilmPage = lazyWithReload(() => import('./pages/FilmPage/FilmPage'), 'FilmPage');
const Blog = lazyWithReload(() => import('./pages/Blog/Blog'), 'Blog');
const BlogPost = lazyWithReload(() => import('./pages/Blog/BlogPost'), 'BlogPost');
const LocationPage = lazyWithReload(() => import('./pages/LocationPage/LocationPage'), 'LocationPage');

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
