// ── THEME TOGGLE ──────────────────────────────────────────────
// Wired up in core/init.js DOMContentLoaded
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  themeToggle.addEventListener('click', () => {
    const html  = document.documentElement;
    const next  = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(themeToggle, { rotation:-30, scale:0.7 }, { rotation:0, scale:1, duration:0.45, ease:'back.out(2.5)' });
    }
    fetch('/theme', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ theme:next }) });
    showToast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode', 'success');
  });
}