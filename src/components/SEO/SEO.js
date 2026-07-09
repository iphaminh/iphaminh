// src/components/SEO/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.phaminh.com'; // keep this as your main domain
const SITE_NAME = 'Phaminh Cinematography';
const DEFAULT_DESCRIPTION =
  'Cinematic wedding videography and photography for couples in the San Francisco Bay Area, Northern California, Northwest Arkansas, and beyond.';
const DEFAULT_IMAGE = `${SITE_URL}/assets/seo/phaminh-wedding-cover.jpg`;

const CANONICAL_PATHS = {
  '/testimonial': '/testimonials',
  '/foto/couples': '/foto/engagement',
  '/foto/portraits': '/foto/portrait',
};

function getCurrentUrl(canonical) {
  if (canonical) return canonical;

  if (typeof window !== 'undefined' && window.location.pathname) {
    const normalizedPath = CANONICAL_PATHS[window.location.pathname] || window.location.pathname;
    return `${SITE_URL}${normalizedPath === '/' ? '/' : normalizedPath}`;
  }

  return `${SITE_URL}/`;
}

function buildBreadcrumbLd(url) {
  if (typeof window === 'undefined') return null;

  const path = window.location.pathname || '/';
  const segments = path.split('/').filter(Boolean);

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ];

  let currentPath = SITE_URL;
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      item: currentPath,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

// Added `image` and `type` props for richer social previews
const SEO = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  children,
}) => {
  const url = getCurrentUrl(canonical);

  const metaTitle = title || SITE_NAME;
  const metaDescription = description || DEFAULT_DESCRIPTION;

  // Build absolute image URL for Open Graph / Twitter
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : DEFAULT_IMAGE;

  // 🔹 Base WebSite schema
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: ['Minh Pham', 'Phaminh', 'Phaminh Wedding Films'],
  };

  // 🔹 Local service business schema
  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    alternateName: ['Minh Pham Wedding Videographer', 'Phaminh Wedding Videography'],
    url: SITE_URL,
    description: metaDescription,
    telephone: '+18702708837',
    email: 'mailto:phaminh@outlook.com',
    priceRange: '$$',
    image: DEFAULT_IMAGE,
    logo: `${SITE_URL}/assets/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Francisco Bay Area',
      addressRegion: 'CA',
      addressCountry: 'US',
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
      sameAs: [
        'https://www.instagram.com/phaminh/',
        'https://vimeo.com/minhpham',
        'https://www.youtube.com/@Phaminh-Cinematography',
      ],
    },
    areaServed: [
      // Bay Area cities
      { '@type': 'City', name: 'San Francisco' },
      { '@type': 'City', name: 'Oakland' },
      { '@type': 'City', name: 'San Jose' },
      { '@type': 'City', name: 'Berkeley' },
      { '@type': 'City', name: 'Napa' },
      { '@type': 'City', name: 'Sonoma' },
      { '@type': 'City', name: 'Santa Clara' },
      { '@type': 'City', name: 'Palo Alto' },
      { '@type': 'City', name: 'Fremont' },
      { '@type': 'City', name: 'Walnut Creek' },
      { '@type': 'City', name: 'San Mateo' },
      { '@type': 'City', name: 'Marin County' },
      { '@type': 'City', name: 'Sacramento' },
      { '@type': 'City', name: 'Healdsburg' },
      { '@type': 'City', name: 'Half Moon Bay' },
      { '@type': 'City', name: 'Sausalito' },
      { '@type': 'City', name: 'Mountain View' },
      { '@type': 'City', name: 'Carmel-by-the-Sea' },
      { '@type': 'City', name: 'Monterey' },
      { '@type': 'AdministrativeArea', name: 'Big Sur' },
      { '@type': 'AdministrativeArea', name: 'Lake Tahoe' },
      // Bay Area regions
      { '@type': 'AdministrativeArea', name: 'San Francisco Bay Area' },
      { '@type': 'AdministrativeArea', name: 'Northern California' },
      { '@type': 'AdministrativeArea', name: 'Silicon Valley' },
      { '@type': 'AdministrativeArea', name: 'East Bay' },
      { '@type': 'AdministrativeArea', name: 'Wine Country' },
      // Northwest Arkansas cities
      { '@type': 'City', name: 'Fayetteville' },
      { '@type': 'City', name: 'Bentonville' },
      { '@type': 'City', name: 'Rogers' },
      { '@type': 'City', name: 'Springdale' },
      { '@type': 'City', name: 'Siloam Springs' },
      { '@type': 'City', name: 'Bella Vista' },
      { '@type': 'City', name: 'Eureka Springs' },
      // Central Arkansas cities
      { '@type': 'City', name: 'Little Rock' },
      { '@type': 'City', name: 'Conway' },
      { '@type': 'City', name: 'Hot Springs' },
      { '@type': 'City', name: 'Fort Smith' },
      { '@type': 'City', name: 'Jonesboro' },
      // Arkansas regions
      { '@type': 'AdministrativeArea', name: 'Northwest Arkansas' },
      { '@type': 'AdministrativeArea', name: 'Central Arkansas' },
      { '@type': 'State', name: 'Arkansas' },
    ],
    serviceType: [
      'Wedding videography',
      'Wedding photography',
      'Elopement videography',
      'Engagement photography',
      'Cinematic wedding films',
    ],
    sameAs: [
      'https://www.instagram.com/phaminh/',
      'https://www.facebook.com/lPhaminh',
      'https://www.youtube.com/@phaminh',
      'https://www.tiktok.com/@phaminh.cinematography',
      'https://vimeo.com/minhpham',
      'https://www.theknot.com/marketplace/phaminh-cinematography-conway-ar-1087669',
      'https://www.weddingwire.com/biz/phaminh-cinematography/a4643b200ae47df1.html',
    ],
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

  // 🔹 WebPage schema for EACH PAGE
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: metaTitle,
    description: metaDescription,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
  };

  // 🔹 Breadcrumb schema (auto from URL)
  const breadcrumbLd = buildBreadcrumbLd(url);

  const allLd = [websiteLd, localBusinessLd, webPageLd];
  if (breadcrumbLd) allLd.push(breadcrumbLd);

  return (
    <Helmet>
      {/* Basic SEO */}
      {metaTitle && <title>{metaTitle}</title>}
      {metaDescription && (
        <meta name="description" content={metaDescription} />
      )}
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, Instagram, etc.) */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={metaTitle} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">{JSON.stringify(allLd)}</script>

      {children}
    </Helmet>
  );
};

export default SEO;
