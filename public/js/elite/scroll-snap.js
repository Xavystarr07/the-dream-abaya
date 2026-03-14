'use strict';
// ─────────────────────────────────────────────────────────────
// SCROLL SNAP — full section transitions with GSAP
// ─────────────────────────────────────────────────────────────
function initScrollSnap() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const sections = document.querySelectorAll(
    '.elite-section, .seasonal-section, .elite-story'
  );

  sections.forEach((section) => {
    const panel = section.querySelector(
      '.section-content-panel, .story-inner, .seasonal-intro'
    );
    const products = section.querySelector('.elite-products-row');
    const chooser  = section.querySelector('.season-chooser');

    // ── Section entrance — scale from slightly small + fade ──
    gsap.fromTo(section,
      { opacity: 0.4, scale: 0.98 },
      {
        opacity: 1, scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 20%',
          scrub: false,
          once: true,
        }
      }
    );

    // ── Content panel — slide up ──────────────────────────────
    if (panel) {
      gsap.fromTo(panel,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            once: true,
          }
        }
      );
    }

    // ── Products row — staggered fade up ─────────────────────
    if (products) {
      gsap.fromTo(products.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            once: true,
          }
        }
      );
    }

    // ── Season chooser cards ──────────────────────────────────
    if (chooser) {
      gsap.fromTo(chooser.children,
        { opacity: 0, y: 40, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: section,
            start: 'top 65%',
            once: true,
          }
        }
      );
    }
  });
}
