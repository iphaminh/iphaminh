// src/pages/CineGallery/CineGallery.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import FooterShowcase from "../../components/FooterShowcase/FooterShowcase";
import SEO from "../../components/SEO/SEO";
import { films } from "../../data/films";
import { enrichmentFor } from "../../data/filmEnrichment";
import "./CineGallery.css";
import { routeMeta } from '../../data/routeMeta';

Modal.setAppElement("#root");

const FALLBACK_THUMB = "/assets/seo/phaminh-wedding-cover.webp";

function vimeoThumb(vimeoId) {
  if (!vimeoId) return FALLBACK_THUMB;
  // Real i.vimeocdn.com thumbnail from the auto-refreshed gallery feed;
  // enrichmentFor falls back to the vumbnail proxy for brand-new films.
  return enrichmentFor(vimeoId).thumbnailUrl;
}

const featuredFilmDetails = [
  {
    slug: "emma-hadar-bay-area-wedding-film",
    eyebrow: "Bay Area Wedding Film",
    summary: "A luminous celebration shaped by real emotion.",
    objectPosition: "center 48%",
  },
  {
    slug: "duy-vy-bay-area-wedding-film",
    eyebrow: "Vietnamese Wedding Film",
    summary: "Tradition, family, and a love story told with intention.",
    objectPosition: "center 46%",
  },
  {
    slug: "kyle-hayley-bay-area-wedding-film",
    eyebrow: "Cinematic Wedding Film",
    summary: "Quiet connection and joy, preserved with a story-first eye.",
    objectPosition: "center 52%",
  },
  {
    slug: "victoria-tyler-california-wedding-film",
    eyebrow: "Northern California Wedding",
    summary: "A timeless celebration filled with warmth and connection.",
    objectPosition: "center 44%",
  },
];

const carouselVideos = featuredFilmDetails
  .map((featured) => {
    const film = films.find((item) => item.slug === featured.slug);
    return film
      ? { ...film, ...featured, img: vimeoThumb(film.vimeoId) }
      : null;
  })
  .filter(Boolean);

export default function CineGallery() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

  const openModal = (vimeoId) => {
    if (!vimeoId) return;
    const embedUrl =
      `https://player.vimeo.com/video/${vimeoId}` +
      `?autoplay=1&muted=0&title=0&byline=0&portrait=0&dnt=1`;
    setSelectedVideoUrl(embedUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedVideoUrl("");
  };

  return (
    <>
      <SEO
        title={routeMeta['/cine'].title}
        description={routeMeta['/cine'].description}
        canonical={routeMeta['/cine'].canonical}
      />

      {/* Hero carousel — recent Bay Area work with preview and film-page links */}
      <Carousel
        className="cine-hero-carousel"
        autoPlay
        infiniteLoop
        interval={7000}
        transitionTime={700}
        stopOnHover
        swipeable
        emulateTouch
        useKeyboardArrows
        showThumbs={false}
        showStatus={false}
        ariaLabel="Featured wedding films"
      >
        {carouselVideos.map((video, index) => (
          <div key={video.slug} className="cine-hero-slide">
            <img
              className="cine-hero-image"
              src={video.img}
              alt={`${video.title} — ${video.location} wedding film`}
              width="1920"
              height="1080"
              loading={index === 0 ? "eager" : "lazy"}
              {...(index === 0 ? { fetchpriority: "high" } : {})}
              decoding={index === 0 ? "sync" : "async"}
              style={{ objectPosition: video.objectPosition }}
            />
            <div className="cine-hero-scrim" aria-hidden="true" />
            <div className="cine-hero-content">
              <p className="cine-hero-eyebrow">{video.eyebrow}</p>
              <h2 className="cine-hero-title">{video.title}</h2>
              <p className="cine-hero-summary">{video.summary}</p>
              <div className="cine-hero-actions">
                <button
                  type="button"
                  className="cine-hero-action cine-hero-play"
                  onClick={() => openModal(video.vimeoId)}
                  aria-label={`Play ${video.title} wedding film`}
                >
                  <span className="cine-hero-play-icon" aria-hidden="true" />
                  Play Film
                </button>
                <Link
                  className="cine-hero-action cine-hero-story"
                  to={`/cine/${video.slug}`}
                >
                  View Story
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Intro content — visible to users and search engines */}
      <section className="cine-intro">
        <p className="cine-intro-eyebrow">The Portfolio</p>
        <h1 className="cine-intro-heading">Wedding Films</h1>
        <div className="cine-intro-rule" aria-hidden="true" />
        <p className="cine-intro-lead">
          We create cinematic wedding films for couples across the San Francisco
          Bay Area, Northern California, and Northwest Arkansas.
        </p>
        <p className="cine-intro-text">
          Each film is crafted with a calm, story-first approach — capturing real
          emotion, natural light, and the moments that matter most.
        </p>
        <nav className="cine-intro-actions" aria-label="Wedding film information">
          <Link className="cine-intro-action cine-intro-action-primary" to="/contact">
            Book Your Wedding Film
          </Link>
          <Link className="cine-intro-action cine-intro-action-secondary" to="/pricing">
            View Pricing
          </Link>
        </nav>
      </section>

      {/* Film grid — each thumbnail links to its own indexable page */}
      <div className="cine-gallery-container">
        {films.map((film) => (
          <Link
            key={film.slug}
            to={`/cine/${film.slug}`}
            className="video-thumbnail"
            aria-label={`Watch ${film.title} — ${film.location} wedding film`}
          >
            <span className="film-card-frame">
              <img
                src={vimeoThumb(film.vimeoId)}
                alt={`${film.title} — ${film.location} wedding film by Phaminh Cinematography`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_THUMB;
                }}
              />
            </span>
            <span className="film-card-caption">
              <span className="film-card-title">{film.title}</span>
              <span className="film-card-location">{film.location}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Carousel preview modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Wedding Film Preview"
        className="video-modal"
        overlayClassName="video-modal-overlay"
      >
        <button
          type="button"
          className="video-modal-close"
          onClick={closeModal}
          aria-label="Close wedding film"
        >
          <span aria-hidden="true">×</span>
        </button>
        {selectedVideoUrl && (
          <iframe
            title="Wedding Film Preview"
            src={selectedVideoUrl}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </Modal>

      <FooterShowcase />
    </>
  );
}
