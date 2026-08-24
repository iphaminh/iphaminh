// src/data/filmEnrichment.js
// Enriches curated films (films.js) with real metadata from the auto-updated
// vimeo-videos.json feed (refreshed every 6h by scripts/update-cine-gallery.js):
// upload date, duration, and first-party i.vimeocdn.com thumbnails.
//
// Everything here is OPTIONAL-forward: a film whose vimeoId isn't in the feed
// yet (e.g. just added by seo-automation.js before the next gallery refresh)
// falls back to the vumbnail proxy and simply omits date/duration — omission
// is valid VideoObject; a fabricated date is not.
//
// CommonJS on purpose: consumed by scripts/prerender.js (plain node) AND the
// React app via webpack. Do not convert to ESM.

const vimeoVideos = require('./vimeo-videos.json');

const byId = {};
for (const v of vimeoVideos) {
  byId[String(v.id)] = v;
}

function toIsoDuration(seconds) {
  if (!seconds || typeof seconds !== 'number' || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `PT${m}M${s}S`;
}

// Returns { thumbnailUrl, uploadDate|null, durationIso|null, durationSeconds|null }
function enrichmentFor(vimeoId) {
  const v = byId[String(vimeoId)] || {};
  const thumbnailUrl =
    v.thumbnailUrl && v.thumbnailUrl.includes('vimeocdn.com')
      ? v.thumbnailUrl
      : `https://vumbnail.com/${vimeoId}.jpg`;
  const uploadDate = v.releaseTime || null;
  const durationSeconds = typeof v.duration === 'number' && v.duration > 0 ? v.duration : null;
  return {
    thumbnailUrl,
    uploadDate,
    durationSeconds,
    durationIso: toIsoDuration(durationSeconds),
  };
}

// Builds the VideoObject JSON-LD for a film — the ONE definition used by both
// the prerendered static head and FilmPage's hydrated head, so they can never
// disagree. Null/absent fields are omitted, never faked. No contentUrl: the
// vimeo.com watch page is HTML, which is invalid there, and Vimeo Plus exposes
// no raw file URLs — embedUrl is the correct and sufficient field.
function videoLdFor(film) {
  const e = enrichmentFor(film.vimeoId);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: film.title,
    description: film.description,
    thumbnailUrl: [e.thumbnailUrl],
    embedUrl: `https://player.vimeo.com/video/${film.vimeoId}`,
    publisher: {
      '@type': 'Organization',
      name: 'Phaminh Cinematography',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.phaminh.com/assets/images/logo.png',
      },
    },
  };
  if (film.date || e.uploadDate) ld.uploadDate = film.date || e.uploadDate;
  if (e.durationIso) ld.duration = e.durationIso;
  if (film.venue || film.city) {
    ld.contentLocation = {
      '@type': 'Place',
      name: film.venue || film.city,
      address: {
        '@type': 'PostalAddress',
        ...(film.city ? { addressLocality: film.city } : {}),
        ...(film.state ? { addressRegion: film.state } : {}),
      },
    };
  }
  return ld;
}

// <title> for /cine/:slug — used by BOTH FilmPage.js and scripts/prerender.js
// so the static and hydrated titles never drift. No long brand suffix: Bing
// flags titles over ~65 chars. When the film's own title already names the
// location ("Georgia Wedding Film" + "Georgia"), the location segment would
// just repeat it — the short brand reads better there.
function filmPageTitle(film) {
  if (film.title.toLowerCase().includes(film.location.toLowerCase())) {
    return `${film.title} | Phaminh`;
  }
  return `${film.title} | ${film.location} Wedding Film`;
}

module.exports = { enrichmentFor, videoLdFor, toIsoDuration, filmPageTitle };
