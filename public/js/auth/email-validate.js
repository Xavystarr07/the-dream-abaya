/* THE DREAM ABAYA — email-validate.js */
'use strict';

// ── EMAIL DOMAIN VALIDATION ───────────────────────────────────

function validateEmailDomain(email) {
  if (!email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  // Accept known domain OR valid TLD structure
  if (VALID_DOMAINS.includes(domain)) return true;
  return /^[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?$/.test(domain);
}

function liveEmailHint(inp) {
  const hint = document.getElementById('hint-email');
  if (!hint) return;
  const val = inp.value.trim();
  if (!val || !val.includes('@')) { hint.textContent = ''; hint.className = 'field-hint'; return; }
  const parts = val.split('@');
  const domain = parts[parts.length - 1].toLowerCase();
  if (!domain || !domain.includes('.')) {
    hint.className = 'field-hint info';
    hint.textContent = '⚠ Enter a complete email address';
    return;
  }
  const base = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  if (!base) {
    hint.className = 'field-hint bad';
    hint.textContent = '✗ Invalid email format';
    return;
  }
  // Suggest close domain matches using levenshtein from core/utils.js
  const close = VALID_DOMAINS.find(d => d !== domain && levenshtein(domain, d) <= 2);
  if (close) {
    hint.className = 'field-hint info';
    hint.textContent = `Did you mean @${close}?`;
    return;
  }
  hint.className = 'field-hint good';
  hint.textContent = '✓ Email looks valid';
}

// ── Attach real-time validation to all email inputs ───────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="email"], input#loginEmail, input#reg-email').forEach(inp => {
    let hint;
    inp.addEventListener('blur', () => {
      const val = inp.value.trim();
      if (!val) return;
      if (!hint) {
        hint = document.createElement('div');
        hint.style.cssText = 'font-size:.64rem;margin-top:4px;transition:color .2s';
        inp.parentElement.appendChild(hint);
      }
      if (validateEmailDomain(val)) {
        hint.style.color = '#4CAF50';
        hint.textContent = '✓ Valid email';
        inp.style.borderColor = 'rgba(76,175,80,.5)';
      } else {
        hint.style.color = '#e74c3c';
        hint.textContent = '⚠ Check your email address';
        inp.style.borderColor = 'rgba(231,76,60,.5)';
      }
    });
    inp.addEventListener('input', () => {
      if (hint) { hint.textContent = ''; inp.style.borderColor = ''; }
    });
  });
});