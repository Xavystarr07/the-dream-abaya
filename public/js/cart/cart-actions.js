// ── CART ACTIONS ──────────────────────────────────────────────
function updateCartCount(count) {
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}
function quickAddCart(productId) {
  // Redirects to product page to force size selection
  window.location.href = `/product/${productId}`;
}