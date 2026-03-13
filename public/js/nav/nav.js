// ── NAV — mobile toggle + click-outside close ─────────────────
function initNav() {
  const nav    = document.querySelector('.royal-nav');

  // ── Scroll: add background when user scrolls down ──────
  const royalNav = document.getElementById('royalNav');
  if (royalNav) {
    window.addEventListener('scroll', () => {
      royalNav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  } // was .site-nav — wrong class
  const toggle = document.getElementById('mobileToggle');
  const mMenu  = document.getElementById('mobileMenu');
  if (toggle && mMenu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mMenu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    mMenu.querySelectorAll('.mobile-link, a').forEach(l => {
      l.addEventListener('click', () => {
        mMenu.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open, .nav-user-menu.open').forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
    if (mMenu && !nav?.contains(e.target)) {
      mMenu.classList.remove('open');
      toggle?.classList.remove('open');
    }
  });
}