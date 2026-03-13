// ── DROPDOWN TOGGLE ───────────────────────────────────────────
// Called inline from nav EJS: onclick="toggleDropdown('profileMenu')"
function toggleDropdown(containerId) {
  const el      = document.getElementById(containerId);
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.nav-dropdown.open, .nav-user-menu.open').forEach(d => d.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
  const btn = el.querySelector('button[aria-expanded]');
  if (btn) btn.setAttribute('aria-expanded', !wasOpen);
}