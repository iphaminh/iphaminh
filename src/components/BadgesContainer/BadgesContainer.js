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

// Filenames and alt text name the REAL award each badge shows (the old
// keyword-stuffed names claimed markets — 'Atlanta', 'near me' — instead of
// describing the recognition, which is worthless for accessibility and SEO).
const badgesData = [
  {
    imageSrc: '/assets/badges_image/best-10-wedding-videographers-little-rock.webp',
    altText: 'The Best 10 Wedding Videographers in Little Rock, Arkansas award',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/the-knot-best-of-weddings-2023.webp',
    altText: 'The Knot Best of Weddings 2023 award',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/big-bear-film-summit-official-selection.webp',
    altText: 'Big Bear Film Summit 2021 Official Selection',
    link: '#',
    className: 'bear-badge',
  },
  {
    imageSrc: '/assets/badges_image/los-angeles-film-awards-quarter-finalist.webp',
    altText: 'Los Angeles Film Awards 2021 Quarter-Finalist',
    link: '#',
  },
  {
    imageSrc: '/assets/badges_image/weddingwire-couples-choice-award.webp',
    altText: "WeddingWire Couples' Choice Awards — Phaminh Cinematography",
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
      <p className="badges-eyebrow">Recognized By</p>
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
