/* THE DREAM ABAYA — email-validate.js */
'use strict';

// ── EMAIL DOMAIN VALIDATION ───────────────────────────────────
const VALID_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com'];
function validateEmailDomain(email) {
  if (!email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  // Accept known domain OR valid TLD structure
  if (VALID_DOMAINS.includes(domain)) return true;
  return /^[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?$/.test(domain);
}

function liveEmailHint(inp) {
  const hint = inp.parentElement.querySelector('#hint-email');
  if (!hint) return;
  const val = inp.value.trim();
  
  if (!val) { 
    hint.textContent = ''; 
    return; 
  }

  // 1. Check for missing @ symbol
  if (!val.includes('@')) {
    hint.style.color = '#f39c12'; // Warning Orange
    hint.textContent = '⚠ Missing "@" symbol';
    return;
  }

  const parts = val.split('@');
  const user = parts[0];
  const domain = parts[1] ? parts[1].toLowerCase() : '';

  // 2. Check for empty username or domain
  if (!user) {
    hint.style.color = '#e74c3c';
    hint.textContent = '⚠ Enter name before "@"';
    return;
  }
  if (!domain) {
    hint.style.color = '#f39c12';
    hint.textContent = '⚠ Enter domain after "@" (e.g. gmail.com)';
    return;
  }

  // 3. Check for missing dot in domain
  if (!domain.includes('.')) {
    hint.style.color = '#f39c12';
    hint.textContent = '⚠ Domain is missing a dot (e.g. .com)';
    return;
  }

  // 4. Suggest close domain matches
  const close = VALID_DOMAINS.find(d => d !== domain && levenshtein(domain, d) <= 2);
  if (close && domain.length > 1) {
    hint.style.color = '#3498db'; // Info Blue
    hint.innerHTML = `Did you mean <strong style="cursor:pointer;text-decoration:underline" onclick="document.querySelector('#${inp.id}').value='${user}@${close}'; document.querySelector('#${inp.id}').dispatchEvent(new Event('input'))">@${close}</strong>?`;
    return;
  }

  // 5. Final format check
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  if (isValid) {
    hint.style.color = '#4CAF50';
    hint.textContent = '✓ Email format is correct';
  } else {
    hint.style.color = '#e74c3c';
    hint.textContent = '⚠ Invalid characters in email';
  }
}

// ── Attach real-time validation to all email inputs ───────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="email"], input#loginEmail, input#reg-email').forEach(inp => {
    const getOrCreateHint = () => {
      let h = inp.parentElement.querySelector('#hint-email');
      if (!h) {
        h = document.createElement('div');
        h.id = 'hint-email';
        h.style.cssText = 'font-size:.64rem;margin-top:4px;transition:color .2s';
        inp.parentElement.appendChild(h);
      }
      return h;
    };

    inp.addEventListener('blur', () => {
      const val = inp.value.trim();
      if (!val) return;
      const hint = getOrCreateHint();
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
      const hint = getOrCreateHint();
      hint.style.color = '';
      inp.style.borderColor = '';
      liveEmailHint(inp);
    });
  });
});