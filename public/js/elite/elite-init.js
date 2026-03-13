// ── ELITE PAGE MASTER INIT ────────────────────────────────────
// Called from index.ejs: initElitePage()
function initElitePage() {
  document.addEventListener('eliteRevealDone', () => {
    initStarField();           // starfield.js
    initFireworks();           // fireworks.js
    initSidebar();             // sidebar.js
    initSectionAnimations();   // section-animations.js
    initCrownsCanvas();        // crowns-canvas.js
    initPerfumeCanvas();       // perfume-canvas.js
    initSeasonalCanvases();    // seasonal-canvases.js
    initScrollSections();      // section-animations.js
    initDreamFloatsCanvas();   // floats-canvas.js
    initModestFloatsCanvas();  // floats-canvas.js
    initHandbagsCanvas();      // floats-canvas.js
    initPerfumesFloatCanvas(); // perfume-canvas.js
    initVoyageSlider();        // voyage-slider.js
  });
  setTimeout(() => document.dispatchEvent(new Event('eliteRevealDone')), 4500);
}