// src/data/businessSchema.js
// The ONE definition of the Phaminh Cinematography business entity for
// structured data. Consumed by BOTH src/components/SEO/SEO.js (hydrated
// Helmet head) and scripts/prerender.js (static head) so the entity AI
// crawlers see without JavaScript is byte-identical to the one Google sees
// after hydration. GPTBot/ClaudeBot/PerplexityBot execute zero JS — before
// this module existed, the raw HTML carried no business schema at all.
//
// CommonJS on purpose: prerender.js is plain `node`. Do not convert to ESM.

const SITE_URL = 'https://www.phaminh.com';
const SITE_NAME = 'Phaminh Cinematography';
const DEFAULT_IMAGE = `${SITE_URL}/assets/seo/phaminh-wedding-cover.webp`;

// One canonical set of profiles — the same list everywhere. A split entity
// graph (different sameAs sets, or the wrong YouTube handle the business
// block used to carry) makes engines treat the profiles as different people.
const SAME_AS = [
  'https://www.instagram.com/phaminh/',
  'https://www.facebook.com/lPhaminh',
  'https://www.tiktok.com/@phaminh.cinematography',
  'https://www.youtube.com/@Phaminh-Cinematography',
  'https://vimeo.com/minhpham',
  'https://www.theknot.com/marketplace/phaminh-cinematography-vacaville-ca-1087669',
  'https://www.weddingwire.com/biz/phaminh-cinematography/a4643b200ae47df1.html',
];

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ['Minh Pham', 'Phaminh', 'Phaminh Wedding Films'],
};

const businessLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#localbusiness`,
  name: SITE_NAME,
  alternateName: ['Minh Pham Wedding Videographer', 'Phaminh Wedding Videography'],
  url: SITE_URL,
  description:
    'Luxury wedding videography and photography by Minh Pham: cinematic, story-driven wedding films for couples in Napa Valley, the San Francisco Bay Area, Sacramento, and Arkansas.',
  telephone: '+18702708837',
  email: 'phaminh@outlook.com',
  priceRange: '$2,500-$8,000',
  image: DEFAULT_IMAGE,
  logo: `${SITE_URL}/assets/images/logo.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Vacaville',
    addressRegion: 'CA',
    postalCode: '95687',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.3566,
    longitude: -121.9877,
  },
  founder: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#minhpham`,
    name: 'Minh Pham',
    jobTitle: 'Wedding Videographer & Cinematographer',
    worksFor: { '@id': `${SITE_URL}/#localbusiness` },
    knowsAbout: [
      'Wedding videography',
      'Cinematic wedding films',
      'Elopement films',
      'Wedding photography',
    ],
    sameAs: SAME_AS,
  },
  areaServed: [
    // Primary markets: Napa Valley and the San Francisco Bay Area
    { '@type': 'AdministrativeArea', name: 'Napa Valley' },
    { '@type': 'City', name: 'Napa' },
    { '@type': 'AdministrativeArea', name: 'Napa County' },
    { '@type': 'City', name: 'Sonoma' },
    { '@type': 'City', name: 'Healdsburg' },
    { '@type': 'AdministrativeArea', name: 'Wine Country' },
    { '@type': 'AdministrativeArea', name: 'San Francisco Bay Area' },
    { '@type': 'City', name: 'San Francisco' },
    { '@type': 'City', name: 'Oakland' },
    { '@type': 'City', name: 'San Jose' },
    { '@type': 'City', name: 'Berkeley' },
    { '@type': 'City', name: 'Santa Clara' },
    { '@type': 'City', name: 'Palo Alto' },
    { '@type': 'City', name: 'Fremont' },
    { '@type': 'City', name: 'Walnut Creek' },
    { '@type': 'City', name: 'San Mateo' },
    { '@type': 'City', name: 'Half Moon Bay' },
    { '@type': 'City', name: 'Sausalito' },
    { '@type': 'City', name: 'Mountain View' },
    { '@type': 'AdministrativeArea', name: 'Marin County' },
    { '@type': 'AdministrativeArea', name: 'Silicon Valley' },
    { '@type': 'AdministrativeArea', name: 'East Bay' },
    // Home base: Solano County, the I-80 corridor, and Sacramento
    { '@type': 'City', name: 'Vacaville' },
    { '@type': 'City', name: 'Fairfield' },
    { '@type': 'City', name: 'Suisun City' },
    { '@type': 'City', name: 'Benicia' },
    { '@type': 'City', name: 'Winters' },
    { '@type': 'City', name: 'Davis' },
    { '@type': 'City', name: 'Sacramento' },
    { '@type': 'AdministrativeArea', name: 'Solano County' },
    { '@type': 'AdministrativeArea', name: 'Suisun Valley' },
    { '@type': 'AdministrativeArea', name: 'Yolo County' },
    // Wider Northern California
    { '@type': 'City', name: 'Carmel-by-the-Sea' },
    { '@type': 'City', name: 'Monterey' },
    { '@type': 'AdministrativeArea', name: 'Big Sur' },
    { '@type': 'AdministrativeArea', name: 'Lake Tahoe' },
    { '@type': 'AdministrativeArea', name: 'Northern California' },
    // Secondary market: Arkansas (kept deliberately short)
    { '@type': 'AdministrativeArea', name: 'Northwest Arkansas' },
    { '@type': 'City', name: 'Little Rock' },
    { '@type': 'City', name: 'Hot Springs' },
    { '@type': 'City', name: 'Eureka Springs' },
  ],
  serviceType: [
    'Wedding videography',
    'Wedding photography',
    'Elopement videography',
    'Engagement photography',
    'Cinematic wedding films',
  ],
  knowsAbout: [
    'wedding videography',
    'elopement films',
    'Napa Valley weddings',
    'San Francisco City Hall elopements',
    'Sonoma wine country weddings',
  ],
  sameAs: SAME_AS,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Wedding film and photography services',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Wedding Videography Packages',
        url: `${SITE_URL}/pricing`,
        priceCurrency: 'USD',
        price: '2700',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Elopement Videography Packages',
        url: `${SITE_URL}/pricing`,
        priceCurrency: 'USD',
        price: '2500',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Engagement Photography and Video',
        url: `${SITE_URL}/contact`,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    ],
  },
};

// Static BreadcrumbList for a path like /wedding-videographer/napa-valley.
// The runtime builder in SEO.js needs `window`, so crawlers never see it —
// prerender uses this instead.
function breadcrumbLdFor(pathname, labelOverrides) {
  const segments = String(pathname || '/').split('/').filter(Boolean);
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
  ];
  let current = SITE_URL;
  segments.forEach((segment, i) => {
    current += `/${segment}`;
    const fallback = segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: (labelOverrides && labelOverrides[segment]) || fallback,
      item: current,
    });
  });
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

module.exports = { websiteLd, businessLd, breadcrumbLdFor, SAME_AS, SITE_URL, SITE_NAME };
