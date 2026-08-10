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

const FALLBACK_THUMB = "/assets/seo/phaminh-wedding-cover.jpg";

function extractVimeoId(urlOrId) {
  const str = String(urlOrId || "").trim();
  const match = str.match(/(\d+)(?:\D*$)/);
  return match ? match[1] : "";
}

function vimeoThumb(vimeoId) {
  if (!vimeoId) return FALLBACK_THUMB;
  // Real i.vimeocdn.com thumbnail from the auto-refreshed gallery feed;
  // enrichmentFor falls back to the vumbnail proxy for brand-new films.
  return enrichmentFor(vimeoId).thumbnailUrl;
}

// Hero carousel — opens a modal on click for immersive preview
const carouselVideos = [
  { img: "/assets/gallery/GA Wedding Video.png", vimeoId: "735641625", label: "Georgia Wedding Film" },
  { img: "/assets/gallery/Ar Wedding Video.png", vimeoId: "751499247", label: "Arkansas Wedding Film" },
  { img: "/assets/gallery/NorthWest Arkansas Wedding Videographer.png", vimeoId: "739310663", label: "Northwest Arkansas Wedding Videographer" },
  { img: "/assets/gallery/NorthWest Arkansas Wedding Videography.png", vimeoId: "506883833", label: "Northwest Arkansas Wedding Videography" },
];

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

  const onKeyOpen = (e, vimeoId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(vimeoId);
    }
  };

  return (
    <>
      <SEO
        title={routeMeta['/cine'].title}
        description={routeMeta['/cine'].description}
        canonical={routeMeta['/cine'].canonical}
      />

      {/* Hero carousel — click to preview in modal */}
      <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
        {carouselVideos.map((video, index) => (
          <div
            key={index}
            className="carousel-slide-click"
            onClick={() => openModal(video.vimeoId)}
            onKeyDown={(e) => onKeyOpen(e, video.vimeoId)}
            role="button"
            tabIndex={0}
            aria-label={`Play ${video.label}`}
          >
            <img src={video.img} alt={video.label} />
          </div>
        ))}
      </Carousel>

      {/* Intro content — visible to users and search engines */}
      <section className="cine-intro">
        <p className="cine-intro-eyebrow">The Portfolio</p>
        <h1 className="cine-intro-heading">Wedding Films</h1>
        <div className="cine-intro-rule" aria-hidden="true" />
        <p className="cine-intro-text">
          We create cinematic wedding films for couples across the San Francisco
          Bay Area, Northern California, and Northwest Arkansas. Each film is
          crafted with a calm, story-first approach — capturing real emotion,
          natural light, and the moments that matter most.{" "}
          <Link to="/contact">Book your wedding film</Link> or{" "}
          <Link to="/pricing">view pricing</Link>.
        </p>
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
