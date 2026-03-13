// ── NAV — mobile toggle + click-outside close ─────────────────
function initNav() {
  const nav    = document.querySelector('.site-nav');
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