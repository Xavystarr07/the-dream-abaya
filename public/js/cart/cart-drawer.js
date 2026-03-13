// ── CART DRAWER ───────────────────────────────────────────────
function initCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);
}
function openCartDrawer()  {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartDrawerOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartDrawerOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}