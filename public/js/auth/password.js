'use strict';

// ── PASSWORD SUGGESTIONS ──────────────────────────────────────
// NOTE: STRONG_PASSWORDS declared here ONLY. Remove from main.js.

function initPasswordSuggestions() {
  const pwFields = document.querySelectorAll(
    'input[type="password"][autocomplete="new-password"], #reg-password, #loginPw'
  );
  pwFields.forEach(inp => {
    const wrap = inp.closest('.auth-input-wrap') || inp.parentElement;
    // Don't double-init
    if (wrap.querySelector('.pw-suggestions')) return;

    const sugDiv = document.createElement('div');
    sugDiv.className = 'pw-suggestions';
    sugDiv.innerHTML = `
      <div class="pw-suggestions-title">💡 Suggested passwords</div>
      ${STRONG_PASSWORDS.slice(0,4).map(pw =>
        `<div class="pw-suggestion-item" onclick="useSuggested('${inp.id}','${pw}')">${pw}</div>`
      ).join('')}
    `;
    wrap.appendChild(sugDiv);

    inp.addEventListener('focus', () => sugDiv.classList.add('show'));
    inp.addEventListener('blur',  () => setTimeout(() => sugDiv.classList.remove('show'), 300));
    inp.addEventListener('input', function() {
      if (this.value.length > 3) sugDiv.classList.remove('show');
      // Update strength bars wherever they exist on the page
      const bar = document.getElementById('pwBar') || document.getElementById('profilePwBar');
      const lbl = document.getElementById('pwLabel') || document.getElementById('profilePwLabel');
      if (bar && lbl) scorePassword(this.value, bar, lbl);
    });
  });
}

function useSuggested(fieldId, pw) {
  const inp = document.getElementById(fieldId);
  if (!inp) return;
  inp.value = pw;
  inp.type  = 'text';
  setTimeout(() => { inp.type = 'password'; }, 1200);
  const bar = document.getElementById('pwBar');
  const lbl = document.getElementById('pwLabel');
  if (bar && lbl) scorePassword(pw, bar, lbl);
  showToast('✓ Password copied — remember to save it!', 'success');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  btn.setAttribute('aria-label', inp.type === 'password' ? 'Show password' : 'Hide password');
}