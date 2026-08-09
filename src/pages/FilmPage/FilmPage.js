// src/pages/FilmPage/FilmPage.js
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import { films } from '../../data/films';
import { enrichmentFor, videoLdFor } from '../../data/filmEnrichment';
import './FilmPage.css';

const SITE_URL = 'https://www.phaminh.com';

export default function FilmPage() {
  const { slug } = useParams();
  const film = films.find((f) => f.slug === slug);

  if (!film) {
    return (
      <div className="film-page-not-found">
        <Helmet>
          <meta name="robots" content="noindex" />
          <title>Film not found | Phaminh Cinematography</title>
        </Helmet>
        <h1>Film not found</h1>
        <p>
          <Link to="/cine">← Back to all films</Link>
        </p>
      </div>
    );
  }

  const embedUrl =
    `https://player.vimeo.com/video/${film.vimeoId}` +
    `?title=0&byline=0&portrait=0&dnt=1`;

  const pageTitle = `${film.title} | ${film.location} Wedding Film | Phaminh Cinematography`;
  const thumbnail = enrichmentFor(film.vimeoId).thumbnailUrl;

  // VideoObject JSON-LD — shared builder (src/data/filmEnrichment.js) keeps
  // this identical to the prerendered static block: real upload date and
  // duration from the Vimeo feed when known, omitted when not, no contentUrl.
  const videoLd = videoLdFor(film);

  return (
    <>
      <SEO
        title={pageTitle}
        description={film.description}
        canonical={`${SITE_URL}/cine/${film.slug}`}
        image={thumbnail}
        type="video.other"
      >
        <script type="application/ld+json">{JSON.stringify(videoLd)}</script>
      </SEO>

      <div className="film-page">
        <Link to="/cine" className="film-page-back">← All Wedding Films</Link>

        <div className="film-page-embed">
          <iframe
            title={film.title}
            src={embedUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="film-page-meta">
          <p className="film-page-location">{film.location}</p>
          <h1 className="film-page-title">{film.title}</h1>
          <p className="film-page-description">{film.description}</p>
        </div>

        <div className="film-page-ctas">
          <Link to="/contact" className="film-page-cta film-page-cta-primary">
            Book Your Film
          </Link>
          <Link to="/pricing" className="film-page-cta film-page-cta-secondary">
            View Packages
          </Link>
          <Link to="/foto" className="film-page-cta film-page-cta-secondary">
            Photography Portfolio
          </Link>
        </div>
      </div>

      <FooterShowcase />
    </>
  );
}
