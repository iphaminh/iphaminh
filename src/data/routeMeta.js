// src/data/routeMeta.js
// Single source of truth for static-route titles, descriptions, and canonicals.
// Consumed by BOTH the React page components and scripts/prerender.js so the
// prerendered <head> and the hydrated Helmet <head> can never drift apart
// (drift makes Google distrust the canonical/title signals).
//
// CommonJS on purpose: prerender.js is plain `node` (no ESM/webpack), while
// CRA's webpack imports CJS fine. Do not convert to `export const`.

const SITE_URL = 'https://www.phaminh.com';

const routeMeta = {
  '/': {
    title: 'Napa Valley & Bay Area Wedding Videographer | Phaminh',
    description:
      'Minh Pham is a luxury wedding videographer in Vacaville, CA — cinematic films across Napa Valley, Sonoma, the Bay Area, Sacramento, and Northwest Arkansas.',
    canonical: `${SITE_URL}/`,
  },
  '/cine': {
    title: 'Wedding Films | Napa, Bay Area & Arkansas | Phaminh',
    description:
      'Watch cinematic wedding films by Minh Pham — real couples across Napa Valley, the Bay Area, Sacramento & Northwest Arkansas. Story-driven, emotional films.',
    canonical: `${SITE_URL}/cine`,
  },
  '/foto': {
    title: 'Wedding Photography | Bay Area & Arkansas | Phaminh',
    description:
      'Timeless wedding photography by Minh Pham — wedding, engagement & portrait sessions across Napa Valley, the Bay Area, Sacramento, and Northwest Arkansas.',
    canonical: `${SITE_URL}/foto`,
  },
  '/foto/wedding': {
    title: 'Wedding Photography Portfolio | Phaminh Cinematography',
    description:
      'Wedding photography portfolio by Minh Pham — real couples across Napa Valley, the Bay Area, and Northwest Arkansas.',
    // Duplicate of /foto (same component renders both) — canonicalize there.
    canonical: `${SITE_URL}/foto`,
  },
  '/foto/engagement': {
    title: 'Engagement Photography | Bay Area & Arkansas | Phaminh',
    description:
      'Engagement photography by Minh Pham — relaxed, candid couples sessions across Napa Valley, the Bay Area, Sacramento, and Northwest Arkansas.',
    canonical: `${SITE_URL}/foto/engagement`,
  },
  '/foto/portrait': {
    title: 'Portrait Photography | Bay Area & Arkansas | Phaminh',
    description:
      'Portrait photography by Minh Pham — natural, story-driven portrait sessions in the Bay Area and Northwest Arkansas.',
    canonical: `${SITE_URL}/foto/portrait`,
  },
  '/pricing': {
    title: 'Wedding Videography Pricing & Packages | Phaminh',
    description:
      'Wedding videography packages from $2,700 and elopement films from $2,500 — full pricing for Napa Valley, Bay Area, Sacramento, and Northwest Arkansas weddings.',
    canonical: `${SITE_URL}/pricing`,
  },
  '/contact': {
    title: 'Contact | Book Your Wedding Videographer | Phaminh',
    description:
      'Book your wedding film with Minh Pham — based in Vacaville, CA, serving Napa Valley, the Bay Area, Sacramento, Northwest Arkansas & destination weddings.',
    canonical: `${SITE_URL}/contact`,
  },
  '/testimonials': {
    title: 'Wedding Videographer Reviews | Phaminh Cinematography',
    description:
      'Real reviews from couples across Napa Valley, the Bay Area, Arkansas, and Georgia who trusted Phaminh Cinematography with their wedding films and photos.',
    canonical: `${SITE_URL}/testimonials`,
  },
  '/blog': {
    title: 'Wedding Videography Blog | Tips, Pricing & Guides | Phaminh',
    description:
      'Practical guides on wedding videography pricing, choosing a videographer, and the best venues in Napa Valley, the Bay Area, and Arkansas — by Minh Pham.',
    canonical: `${SITE_URL}/blog`,
  },
  '/wedding-videographer': {
    title: 'Wedding Videographer in California & Arkansas | Phaminh',
    description:
      'Cinematic wedding films across Northern California — Napa Valley, Vacaville, San Francisco, Sacramento, Tahoe — and Arkansas, from NWA to Hot Springs.',
    canonical: `${SITE_URL}/wedding-videographer`,
  },
};

module.exports = { routeMeta, SITE_URL };
