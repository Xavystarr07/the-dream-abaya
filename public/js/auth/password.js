'use strict';

// ── PASSWORD SUGGESTIONS ──────────────────────────────────────
const STRONG_PASSWORDS = [
  'RoyalDream2025!',
  'GoldenAbaya@24',
  'VelvetPalace#25',
  'SilkElegance$24',
  'PearlLustre%25',
  'CrystalNoble^24',
  'LunarGrace&25',
  'MysticCharm*24',
  'AmberRadiance+25',
  'IvorySophistry=24',
  'AzureRegency-25',
  'SacredJewels_24',
  'DivineThread!25',
  'NobleWeave@24',
  'PalaceSecret#25'
];

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

// ── PASSWORD STRENGTH SCORING ───────────────────────────────────
function scorePassword(password, bar, label) {
  if (!password) {
    bar.style.width = '0%';
    bar.style.background = '#e74c3c';
    label.textContent = '';
    return;
  }
  
  let score = 0;
  const checks = [
    { test: password.length >= 8, weight: 1 },
    { test: password.length >= 12, weight: 1 },
    { test: /[a-z]/.test(password), weight: 1 },
    { test: /[A-Z]/.test(password), weight: 1 },
    { test: /[0-9]/.test(password), weight: 1 },
    { test: /[^a-zA-Z0-9]/.test(password), weight: 2 }
  ];
  
  checks.forEach(check => {
    if (check.test) score += check.weight;
  });
  
  const percentage = Math.min((score / 7) * 100, 100);
  const colors = [
    { threshold: 0, color: '#e74c3c', label: '' },
    { threshold: 20, color: '#e67e22', label: 'Weak' },
    { threshold: 40, color: '#f1c40f', label: 'Fair' },
    { threshold: 60, color: '#3498db', label: 'Good' },
    { threshold: 80, color: '#2ecc71', label: 'Strong' }
  ];
  
  const current = colors.reverse().find(c => percentage >= c.threshold);
  bar.style.width = percentage + '%';
  bar.style.background = current.color;
  label.textContent = current.label;
}