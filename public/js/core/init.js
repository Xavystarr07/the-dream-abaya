// ── MASTER BOOTSTRAPPER ───────────────────────────────────────
// Single DOMContentLoaded listener — replaces the one in main.js
// Every module's init function is called from here.
document.addEventListener('DOMContentLoaded', () => {
  initNav();           // nav/nav.js
  initTheme();         // core/theme.js
  // Cart drawer event wiring — inline so load order doesn't matter
  document.getElementById('cartDrawerOverlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);    // cart/cart-drawer.js  (event listeners only)
  initSearchSuggestions(); // ui/search-suggestions.js
  initForms();         // ui/forms.js
  initPasswordSuggestions(); // auth/password.js
  initWelcomeParams(); // inline below — reads URL ?welcome=1
  initEscapeKey();     // keyboard shortcuts

  // Welcome/bye toast from URL
  function initWelcomeParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === '1') {
      const name = params.get('name');
      const msg  = params.get('newuser') ? `✨ Welcome to the palace!` : `✦ Welcome back${name ? ', ' + name : ''}!`;
      setTimeout(() => showToast(msg, 'success'), 500);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('bye') === '1') {
      setTimeout(() => showToast('👋 Hope to see you again soon!', 'success'), 400);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  function initEscapeKey() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeCartDrawer(); closeLightbox(); closeProfileModal(); }
    });
  }
});