// src/components/BadgesContainer/BadgesContainer.js
import React, { useState, useEffect } from 'react';
import './BadgesContainer.css';
import Badge from '../Badge/Badge';

const badgesData = [
  {
    imageSrc: '/assets/badges_image/arkansas-wedding-videographer.webp',
    altText: 'Arkansas Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/atlanta-wedding-videographer.webp',
    altText: 'Atlanta Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/best-wedding-videographer.webp',
    altText: 'Best Wedding Videographer',
    link: '#',
    className: 'bear-badge' // Add a unique class
  },
  {
    imageSrc: '/assets/badges_image/top-wedding-videographer.webp',
    altText: 'Top Wedding Videographer',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/videographer-near-me.webp',
    altText: 'Videographer Near Me',
    link: '#',
  },
];
const BadgesContainer = () => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calculateGap = () => {
    const initialGap = 55;
    const minGap = 24;
    return Math.max(initialGap - scrollY / 12, minGap);
  };

  return (
    <div className="badges-section">
      <div className="badges-container" style={{ gap: `${calculateGap()}px` }}>
        {badgesData.map((badge, index) => (
          <Badge key={index} {...badge} />
        ))}
      </div>
    </div>
  );
};

export default BadgesContainer;
