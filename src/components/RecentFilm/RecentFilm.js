// src/components/RecentFilm/RecentFilm.js
import React from 'react';
import './RecentFilm.css';

const filmsData = [
  {
    title: "Wedding Photographer in Arkansas",
    subtitle: "Capturing timeless moments",
    thumbnail: '/assets/recent_film/wedding-photographer-in-arkansas.png',
    videoUrl: "https://vimeo.com/608232970"
  },
  {
    title: "Arkansas Wedding Videography",
    subtitle: "Telling your story beautifully",
    thumbnail: '/assets/recent_film/arkansas-wedding-videography.png',
    videoUrl: "https://vimeo.com/770458916"
  },
  {
    title: "Arkansas Wedding Videographer",
    subtitle: "Creating cinematic experiences",
    thumbnail: '/assets/recent_film/arkansas-wedding-videographer.png',
    videoUrl: "https://vimeo.com/889737378"
  },
];

const RecentFilm = () => {
  return (
    <div className="recent-film-container">
      <h2 className="recent-film-title">RECENT FILM</h2>
      <hr className="title-underline" />
      <div className="film-thumbnails">
        {filmsData.map((film, index) => (
          <a
            key={index}
            href={film.videoUrl}
            target="popup"
            onClick={(e) => {
              e.preventDefault();
              window.open(film.videoUrl, 'popup', 'width=600,height=400');
            }}
            className="film-thumbnail"
          >
            <img src={film.thumbnail} alt={film.title} />
            <div className="overlay">
              <p className="film-title">{film.title}</p>
              <p className="film-subtitle">{film.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RecentFilm;
