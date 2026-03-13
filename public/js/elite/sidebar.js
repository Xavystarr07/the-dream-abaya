'use strict';
// ─────────────────────────────────────────────────────────────
// SIDEBAR — track active section
// ─────────────────────────────────────────────────────────────
function initSidebar() {
  const links = document.querySelectorAll('.sb-link');
  if (!links.length) return;

  const sections = [];
  links.forEach(l => {
    const id = l.getAttribute('href')?.replace('#','');
    if (id) {
      const el = document.getElementById(id);
      if (el) sections.push({ el, link: l });
    }
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sections.forEach(s => s.link.classList.toggle('active', s.el === entry.target));
      }
    });
  }, { threshold: .3 });

  sections.forEach(s => obs.observe(s.el));

  // Smooth scroll on click
  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const id = l.getAttribute('href')?.replace('#','');
      document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
}