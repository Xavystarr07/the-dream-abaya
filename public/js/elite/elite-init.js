// ── ELITE PAGE MASTER INIT ────────────────────────────────────
// Called from index.ejs: initElitePage()
function initElitePage() {
 document.addEventListener('eliteRevealDone', () => {
    // Only hero canvas runs — all section animations disabled for now
    if (!window.__eliteCanvasReady) {
      initStarField();
      initFireworks();
    }
  });

  setTimeout(() => document.dispatchEvent(new Event('eliteRevealDone')), 4500);
}