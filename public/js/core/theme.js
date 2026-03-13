// ── THEME TOGGLE ──────────────────────────────────────────────
// Saves theme to session via POST, then persists across all pages
// via data-theme on <html> which EJS renders server-side

function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    // 1. Update DOM immediately so user sees change
    html.setAttribute('data-theme', next);

    // 2. GSAP bounce animation on button
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(themeToggle,
        { rotation: -30, scale: 0.7 },
        { rotation: 0,   scale: 1, duration: 0.45, ease: 'back.out(2.5)' }
      );
    }

    // 3. Save to session — wait for response before allowing next nav
    //    We store in localStorage as a fast fallback too
    localStorage.setItem('tda-theme', next);

    fetch('/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next })
    }).catch(() => {}); // silent fail — localStorage handles offline

    showToast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode', 'success');
  });

  // On every page load: sync localStorage → DOM in case session lags
  // (server-side data-theme is source of truth, this is a safety net)
  const stored = localStorage.getItem('tda-theme');
  const current = document.documentElement.getAttribute('data-theme');
  if (stored && stored !== current) {
    document.documentElement.setAttribute('data-theme', stored);
    // Re-sync server silently
    fetch('/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: stored })
    }).catch(() => {});
  }
}