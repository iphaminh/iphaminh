// src/pages/FilmPage/FilmPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import { films } from '../../data/films';
import './FilmPage.css';

export default function FilmPage() {
  const { slug } = useParams();
  const film = films.find((f) => f.slug === slug);

  if (!film) {
    return (
      <div className="film-page-not-found">
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

  return (
    <>
      <SEO
        title={pageTitle}
        description={film.description}
        canonical={`https://www.phaminh.com/cine/${film.slug}`}
      />

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
