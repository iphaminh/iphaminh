---
name: phaminh-performance-insights
description: Lighthouse scores and bundle analysis for phaminh.com — what's causing the 79 KiB unused JS warning and accessibility score of 85
metadata:
  type: project
---

Performance score: 93/100. Accessibility: 85/100. Best Practices: 96/100.

**Biggest bundle offender:** `@nextui-org/react` is used ONLY for the Navbar component but pulls in framer-motion (dozens of chunks), react-aria, tailwind-merge, tailwind-variants — together ~50+ KiB of unused JS. Replacing NextUI Navbar with a plain React component would be the single biggest performance improvement available.

**Why:** NextUI was chosen for the Navbar early in development. Every other component on the site is custom CSS. The NavBar is the only NextUI usage.

**How to apply:** When touching the Navbar or performance, always recommend removing @nextui-org/react and replacing with a plain React+CSS navbar. The current Navbar logic is simple: sticky header, logo center, two groups of links, hamburger on mobile below 1024px.

**Accessibility issues (score 85):**
- "Lists do not contain only `<li>` elements" — caused by NextUI Navbar HTML structure (can't fix without removing NextUI)
- "List items not in ul/ol/menu" — same cause
- Background/foreground contrast — light gray text (#666, #999) on white in some sections
- `<video>` element missing `<track kind="captions">` — hero video on landing page

**Render blocking:** Google Fonts load is the main render-blocking resource (550ms). Consolidated to one request already. Self-hosting fonts would eliminate this entirely but is a larger change.

**Image delivery:** 1,668 KiB savings possible by converting PNG testimonial/gallery images to WebP. This is an asset optimization task, not a code change.

**blogPosts.js:** 15.7 KiB — largest user-written file in bundle. Could be code-split per route but not worth the complexity at current scale.
