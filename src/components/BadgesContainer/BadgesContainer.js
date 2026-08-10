// src/components/BadgesContainer/BadgesContainer.js
// Award strip with 2026-style motion, all hardware-accelerated:
//  1. Staggered reveal — badges fade+rise one by one when scrolled into view
//     (IntersectionObserver, fires once).
//  2. Gentle parallax drift — each badge translates at a slightly different
//     rate while scrolling, giving the row a floating, layered feel.
//  3. Hover micro-interaction — grayscale at rest, full color + lift on hover
//     (see BadgesContainer.css).
// No animation libraries; respects prefers-reduced-motion via CSS.
import React, { useEffect, useRef, useState } from 'react';
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
    className: 'bear-badge',
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

// Per-badge parallax factors — alternating directions keeps the drift organic.
const DRIFT = [-0.045, 0.03, -0.06, 0.035, -0.05];
const MAX_DRIFT_PX = 14;

const BadgesContainer = () => {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [drift, setDrift] = useState(0);

  // 1) Staggered reveal, once, when the strip enters the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2) Scroll-linked drift, rAF-throttled, relative to the strip's viewport position.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        // -1 (below viewport) → 0 (centered) → 1 (above viewport)
        const progress = 1 - (rect.top + rect.height / 2) / (viewport / 2);
        setDrift(Math.max(-1, Math.min(1, progress)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={`badges-section${revealed ? ' badges-revealed' : ''}`} ref={sectionRef}>
      <div className="badges-container">
        {badgesData.map((badge, index) => (
          <div
            key={badge.imageSrc}
            className="badge-wrap"
            style={{
              transitionDelay: `${index * 110}ms`,
              '--drift': `${(drift * DRIFT[index] * MAX_DRIFT_PX * 20).toFixed(2)}px`,
            }}
          >
            <Badge {...badge} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesContainer;
