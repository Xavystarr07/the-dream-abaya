'use strict';
// ── Aliases ──────────────────────────────────────────────────
var rand  = rand  || function(mn,mx){ return Math.random()*(mx-mn)+mn; };
var irand = irand || function(mn,mx){ return Math.floor(rand(mn,mx+1)); };

// ─────────────────────────────────────────────────────────────
// HERO SLIDER  — Swiper with fireworks on slide 1
// ─────────────────────────────────────────────────────────────
function initHeroSlider() {
  if (typeof Swiper === 'undefined') {
    console.warn('HeroSlider: Swiper not loaded');
    return;
  }

  const blurEl = document.querySelector('#hero-motion-blur feGaussianBlur');

  const swiper = new Swiper('.hero-swiper', {
    speed: 1500,
    loop: true,
    mousewheel: false,  // scroll wheel scrolls the PAGE not the slides
    autoplay: {
      delay: 8000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.hero-swiper .swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.hero-slider-next',
      prevEl: '.hero-slider-prev',
    },
    on: {
      // Motion blur on slide transition
      transitionStart() {
        if (!blurEl) return;
        gsap.to(blurEl, {
          duration: 0.5,
          attr: { stdDeviation: '35,0' },
          ease: 'power2.out',
          onComplete() {
            gsap.to(blurEl, {
              duration: 0.9,
              attr: { stdDeviation: '0,0' },
              ease: 'power2.inOut',
            });
          },
        });
      },
      // Pause/resume fireworks when on slide 1
      slideChange() {
        const isFireworks = this.realIndex === 0;
        // Signal elite-init to pause/resume canvas RAF loops if needed
        document.dispatchEvent(new CustomEvent('heroSlideChange', {
          detail: { index: this.realIndex, isFireworks }
        }));
      },
    },
  });

  // Re-trigger starfield resize now that swiper has sized the slide
  setTimeout(() => {
    const starsCanvas = document.getElementById('starsCanvas');
    const fireworksCanvas = document.getElementById('fireworksCanvas');
    if (starsCanvas) {
      starsCanvas.width  = starsCanvas.offsetWidth  || window.innerWidth;
      starsCanvas.height = starsCanvas.offsetHeight || window.innerHeight;
    }
    if (fireworksCanvas) {
      fireworksCanvas.width  = fireworksCanvas.offsetWidth  || window.innerWidth;
      fireworksCanvas.height = fireworksCanvas.offsetHeight || window.innerHeight;
    }
  }, 100);

  return swiper;
}
