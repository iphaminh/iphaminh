// src/components/SEO/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { websiteLd, businessLd } from '../../data/businessSchema';

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
    // Canonical form is slash-less (matches the prerendered static canonicals
    // and the .htaccess trailing-slash strip) — never emit /pricing/ style URLs.
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    const normalizedPath = CANONICAL_PATHS[p] || p;
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

  // websiteLd/businessLd come from src/data/businessSchema.js — the same
  // objects prerender bakes into the static HTML, so the two heads agree.
  const allLd = [websiteLd, businessLd, webPageLd];
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
