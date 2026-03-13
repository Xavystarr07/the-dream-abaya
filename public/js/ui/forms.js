// ── FORM UTILITIES ────────────────────────────────────────────
// XSS strip + double-submit prevention
function initForms() {
  // Strip script tags from text inputs on submit
  document.querySelectorAll('input[type="text"], textarea').forEach(inp => {
    inp.addEventListener('blur', function() {
      this.value = this.value.replace(/(<script[\s\S]*?>[\s\S]*?<\/script>|<[^>]+>)/gi, '');
    });
  });
  // Double submit prevention
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
      const btn = this.querySelector('[type="submit"]');
      if (btn && !btn.dataset.noLock) {
        setTimeout(() => { btn.disabled = true; }, 10);
      }
    });
  });
}