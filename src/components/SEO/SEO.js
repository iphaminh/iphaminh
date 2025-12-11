// src/components/SEO/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.phaminh.com'; // keep this as your main domain
const SITE_NAME = 'Phaminh Cinematography';

function getCurrentUrl(canonical) {
  if (canonical) return canonical;

  if (typeof window !== 'undefined' && window.location.href) {
    return window.location.href;
  }

  return SITE_URL;
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
  const metaDescription =
    description ||
    'Emotional, cinematic wedding videography and photography for couples in the San Francisco Bay Area and Arkansas.';

  // Build absolute image URL for Open Graph / Twitter
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}/assets/seo/phaminh-wedding-cover.jpg`;

  // 🔹 Base WebSite schema
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
  };

  // 🔹 LocalBusiness schema
  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    description: metaDescription,
    telephone: '+1-870-270-8837',
    email: 'mailto:phaminh@outlook.com',
    priceRange: '$$',
    image: `${SITE_URL}/assets/seo/phaminh-wedding-cover.jpg`, // make sure this file exists in /public/assets/seo/
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'San Francisco Bay Area',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'City', name: 'San Francisco' },
      { '@type': 'City', name: 'Oakland' },
      { '@type': 'City', name: 'San Jose' },
      { '@type': 'State', name: 'Arkansas' },
    ],
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