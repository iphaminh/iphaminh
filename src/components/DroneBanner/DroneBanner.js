// DroneBanner.js
// Contact-page banner: Minh's drone photo split into two layers. The sky and
// field are one image; the drone was cut out into a transparent layer and the
// patch behind it filled. On scroll the drone lifts out of the banner with a
// little inertia and bank, the background parallaxes gently, and at rest the
// drone keeps a faint hover. Honors prefers-reduced-motion (static picture).
import React, { useEffect, useRef } from 'react';
import './DroneBanner.css';

// Natural size of contact-drone-sky.webp and the box the drone layer was cut
// from, in the same pixel space. The drone is positioned with the same cover
// math the browser uses for object-fit, so it sits exactly over the filled
// patch at rest on every screen size.
const SKY = { w: 2400, h: 1600 };
const DRONE = { x: 789, y: 633, w: 827, h: 202 };
const SKY_SRC = '/assets/images/contact-drone-sky.webp';
const DRONE_SRC = '/assets/images/contact-drone.webp';

// Visible propeller hubs in the drone layer's own pixel space (x, y, diameter,
// opacity). Each gets two blade pairs sweeping the projected ellipse of an
// edge-on disc over the photo's own motion-blur streak (see the CSS).
const PROPS = [
  { x: 182, y: 34, d: 335, o: 0.8 },  // front left
  { x: 636, y: 60, d: 342, o: 0.75 }, // front right
  { x: 255, y: 106, d: 200, o: 0.5 }, // rear left, behind the arm
  { x: 750, y: 98, d: 110, o: 0.3 }, // rear right, mostly hidden
];

const LIFT = 0.8;    // fraction of the banner height the drone climbs while the banner scrolls away
const DRIFT = 0.06;   // fraction of the banner width it drifts to the right meanwhile
const BG_SHIFT = 0.16; // background parallax, fraction of the banner height (matches the CSS 116% sky)
const MAX_BANK = 6;   // degrees

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const DroneBanner = () => {
  const rootRef = useRef(null);
  const skyRef = useRef(null);
  const droneRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const sky = skyRef.current;
    const drone = droneRef.current;
    if (!root || !sky || !drone) return undefined;

    // offsetWidth/Height/Top ignore CSS transforms, so this stays correct mid-animation.
    const place = () => {
      const sw = sky.offsetWidth;
      const sh = sky.offsetHeight;
      const s = Math.max(sw / SKY.w, sh / SKY.h);
      const ox = (sw - SKY.w * s) / 2;
      const oy = sky.offsetTop + (sh - SKY.h * s) / 2;
      drone.style.left = `${ox + DRONE.x * s}px`;
      drone.style.top = `${oy + DRONE.y * s}px`;
      drone.style.width = `${DRONE.w * s}px`;
    };
    place();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null;
    if (ro) ro.observe(root);
    else window.addEventListener('resize', place);

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      return () => {
        if (ro) ro.disconnect();
        else window.removeEventListener('resize', place);
      };
    }

    let cur = 0; // eased progress 0..1
    let target = 0;
    let bank = 0;
    let raf = 0;
    let visible = true;

    const tick = () => {
      raf = 0;
      const prev = cur;
      cur += (target - cur) * 0.14; // inertia: the drone trails the scroll a little
      const v = cur - prev;
      bank += (Math.max(-MAX_BANK, Math.min(MAX_BANK, -v * 160)) - bank) * 0.2;
      const cw = root.clientWidth;
      const ch = root.clientHeight;
      drone.style.transform = `translate3d(${cur * DRIFT * cw}px, ${-cur * LIFT * ch}px, 0) rotate(${bank.toFixed(2)}deg)`;
      sky.style.transform = `translate3d(0, ${cur * BG_SHIFT * ch}px, 0)`;
      if (Math.abs(target - cur) > 0.0005 || Math.abs(bank) > 0.05) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!visible) return;
      target = clamp01(window.scrollY / Math.max(1, root.clientHeight));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) onScroll();
          }, { rootMargin: '200px 0px' })
        : null;
    if (io) io.observe(root);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', place);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="drone-banner" ref={rootRef}>
      <img
        ref={skyRef}
        className="drone-banner-sky"
        src={SKY_SRC}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchpriority="high"
        width={SKY.w}
        height={SKY.h}
      />
      <div className="drone-banner-drone" ref={droneRef}>
        <div className="drone-banner-body">
          <img
            src={DRONE_SRC}
            alt="Minh's drone hovering over a golden field at sunset"
            decoding="async"
            width={DRONE.w}
            height={DRONE.h}
          />
          {PROPS.map((p, i) => (
            <span
              key={i}
              className="drone-banner-prop"
              aria-hidden="true"
              style={{
                left: `${(p.x / DRONE.w) * 100}%`,
                top: `${(p.y / DRONE.h) * 100}%`,
                width: `${(p.d / DRONE.w) * 100}%`,
                opacity: p.o,
                '--stagger': `${-i * 0.09}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DroneBanner;
