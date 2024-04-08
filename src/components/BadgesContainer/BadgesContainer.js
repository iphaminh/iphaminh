// src/components/BadgesContainer/BadgesContainer.js
import React, { useState, useEffect } from 'react';
import './BadgesContainer.css';
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
    className: 'bear-badge' // Add a unique class
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
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate the gap based on scroll position
  const calculateGap = () => {
    const initialGap = 100; // The starting gap when at the top of the page, before scrolling.
    const minGap = 40; // The minimum gap you want when fully scrolled down.
  
    // We subtract from the initial gap based on scroll to close the gap as we scroll down.
    const gap = Math.max(initialGap - scrollY / 10, minGap);
  
    return gap;
  };

  return (
    <div className="badges-container" style={{ gap: `${calculateGap()}px` }}> 
      {badgesData.map((badge, index) => (
        <Badge key={index} {...badge} />
      ))}
    </div>
  );
};

export default BadgesContainer;
