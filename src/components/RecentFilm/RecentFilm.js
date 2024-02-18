// src/components/RecentFilm/RecentFilm.js
import React from 'react';
import './RecentFilm.css'; // make sure to import your CSS file

const RecentFilm = () => {
  // Define your video data here
  const filmData = [
    {
      title: 'Romance at the Bluff',
      description: 'inspired by Bieber\'s choice',
      imageSrc: '/assets/recent_film/wedding-photographer-in-Arkansas.png',
      vimeoLink: 'https://vimeo.com/608232970'
    },
    {
      title: 'Estate elegance',
      description: 'A fairlane love story',
      imageSrc: '/assets/recent_film/arkansas-wedding-videography.png',
      vimeoLink: 'https://vimeo.com/770458916'
    },
    {
      title: 'Rustic romance',
      description: 'A kindred barn wedding',
      imageSrc: '/assets/recent_film/arkansas-wedding-videographer.png',
      vimeoLink: 'https://vimeo.com/889737378'
    }
  ];

  return (
    <div className="recent-film-container">
      <h2 className="recent-film-header">RECENT FILM</h2>
      <div className="film-line"></div>
      <div className="film-thumbnails">
        {filmData.map((film, index) => (
          <div className="film-thumbnail" key={index}>
            <a href={film.vimeoLink} target="_blank" rel="noopener noreferrer">
              <img src={film.imageSrc} alt={film.title} />
              <div className="film-caption">
                <h3>{film.title}</h3>
                <p>{film.description}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentFilm;
