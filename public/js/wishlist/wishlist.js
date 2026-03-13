// ── WISHLIST TOGGLE ───────────────────────────────────────────
function toggleWishlist(btn, productId, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  fetch('/wishlist/toggle', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ product_id: productId })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      btn.classList.toggle('active', data.action === 'added');
      showToast(data.action === 'added' ? '❤️ Added to wishlist' : '🩶 Removed from wishlist', 'success');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(btn, { scale:0.7 }, { scale:1, duration:0.4, ease:'back.out(3)' });
      }
    }
  })
  .catch(() => showToast('Something went wrong', 'error'));
}