// src/pages/CineGallery/CineGallery.js
import React, { useState } from "react";
import Modal from "react-modal";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import FooterShowcase from "../../components/FooterShowcase/FooterShowcase";
import SEO from "../../components/SEO/SEO";
import "./CineGallery.css";

Modal.setAppElement("#root"); // Important for accessibility

const FALLBACK_THUMB = "/assets/seo/phaminh-wedding-cover.jpg";

function extractVimeoId(urlOrId) {
  const str = String(urlOrId || "").trim();
  const match = str.match(/(\d+)(?:\D*$)/);
  return match ? match[1] : "";
}

function vimeoThumb(urlOrId) {
  const id = extractVimeoId(urlOrId);
  if (!id) return FALLBACK_THUMB;

  // No Vimeo API/token fetching: thumbnail derived from Vimeo ID.
  return `https://vumbnail.com/${id}.jpg`;
}

// Top hero carousel videos (DO NOT CHANGE)
const carouselVideos = [
  {
    img: "/assets/gallery/GA Wedding Video.png",
    videoUrl: "https://vimeo.com/735641625",
  },
  {
    img: "/assets/gallery/Ar Wedding Video.png",
    videoUrl: "https://vimeo.com/751499247",
  },
  {
    img: "/assets/gallery/NorthWest Arkansas Wedding Videographer.png",
    videoUrl: "https://vimeo.com/739310663",
  },
  {
    img: "/assets/gallery/NorthWest Arkansas Wedding Videography.png",
    videoUrl: "https://vimeo.com/506883833",
  },
];

// Grid gallery videos (below the carousel)
const gridVideos = [
  { videoUrl: "https://vimeo.com/1145842678", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/608232970", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/1145833331", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/1145837841", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/1145835171", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/1145843833", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/735641625", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/889737378", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/1145842030", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/579239863", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/738121759", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/907939938", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/770458916", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/739312203", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/763166896", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/889342561", title: "Wedding Film" },
  { videoUrl: "https://vimeo.com/889359140", title: "Wedding Film" },
];

export default function CineGallery() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

  const openModal = (videoUrl) => {
    const id = extractVimeoId(videoUrl);
    if (!id) return;

    // Clicked by user -> autoplay allowed; sound may still depend on browser settings.
    const embedUrl =
      `https://player.vimeo.com/video/${id}` +
      `?autoplay=1&muted=0&title=0&byline=0&portrait=0&dnt=1`;

    setSelectedVideoUrl(embedUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedVideoUrl("");
  };

  const onKeyOpen = (e, url) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(url);
    }
  };

  return (
    <>
      <SEO
        title="Bay Area Wedding Films | California Wedding Videographer | Phaminh Cinematography"
        description="Watch cinematic wedding highlight films from the California Bay Area. Emotional storytelling, modern editing, and real moments captured beautifully on film."
      />

      {/* Hero carousel */}
      <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
        {carouselVideos.map((video, index) => (
          <div
            key={index}
            className="carousel-slide-click"
            onClick={() => openModal(video.videoUrl)}
            onKeyDown={(e) => onKeyOpen(e, video.videoUrl)}
            role="button"
            tabIndex={0}
          >
            <img src={video.img} alt={`Carousel Video ${index + 1}`} />
          </div>
        ))}
      </Carousel>

      {/* Grid gallery */}
      <div className="cine-gallery-container">
        {gridVideos.map((video, index) => (
          <div
            key={index}
            className="video-thumbnail"
            onClick={() => openModal(video.videoUrl)}
            onKeyDown={(e) => onKeyOpen(e, video.videoUrl)}
            role="button"
            tabIndex={0}
            title={video.title}
          >
            <img
              src={vimeoThumb(video.videoUrl)}
              alt={video.title}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_THUMB;
              }}
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Video Modal"
        className="video-modal"
        overlayClassName="video-modal-overlay"
      >
        {selectedVideoUrl && (
          <iframe
            title="Selected Video"
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