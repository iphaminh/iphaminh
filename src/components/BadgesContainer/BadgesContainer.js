// src/components/BadgesContainer/BadgesContainer.js
import React from 'react';
import Badge from '../Badge/Badge';

const badgesData = [
  {
    imageSrc: '/assets/badges_image/arkansas-wedding-videographer.png',
    altText: 'Arkansas Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/atlanta-wedding-videographer.png',
    altText: 'Atlanta Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/best-wedding-videographer.png',
    altText: 'Best Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/top-wedding-videographer.png',
    altText: 'Top Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/videographer-near-me.png',
    altText: 'Videographer Near Me',
    link: '#',
  },
];

const BadgesContainer = () => {
  return (
    <div className="badges-container">
      {badgesData.map((badge, index) => (
        <Badge key={index} {...badge} />
      ))}
    </div>
  );
};

export default BadgesContainer;
