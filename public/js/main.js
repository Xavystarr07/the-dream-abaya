/* ============================================================
   THE DREAM ABAYA v2 — main.js  FULLY UPDATED
   Fixes: click dropdowns, profile modal, search suggestions,
          welcome/bye toasts, password suggestions, home = top
   ============================================================ */

// ── CURTAIN REVEAL ────────────────────────────────────────────
function initReveal() {
  const overlay = document.getElementById('reveal-overlay');
  if (!overlay || typeof gsap === 'undefined') return;
  document.body.style.overflow = 'hidden';
  const tl = gsap.timeline({
    onComplete: () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      revealHeroContent();
    }
  });
  tl.fromTo('#reveal-text', { opacity:0, y:18 }, { opacity:1, y:0, duration:1.0, ease:'power3.out' });
  tl.to({}, { duration: 2.2 });
  tl.to('#reveal-text', { opacity:0, scale:1.04, duration:0.45, ease:'power2.in' });
  tl.to('#reveal-left',  { xPercent:-100, duration:1.3, ease:'expo.inOut' }, '+=0.05');
  tl.to('#reveal-right', { xPercent:100,  duration:1.3, ease:'expo.inOut' }, '<');
}

function revealHeroContent() {
  if (typeof gsap === 'undefined') return;
  gsap.to('.hero-eyebrow',    { opacity:1, y:0, duration:0.7, ease:'power3.out' });
  gsap.fromTo('.hero-word',   { opacity:0, y:40, rotateX:-15 }, { opacity:1, y:0, rotateX:0, duration:0.85, stagger:0.13, ease:'power3.out', delay:0.25 });
  gsap.fromTo('.hero-word-em',{ opacity:0, y:40, skewX:-5 },    { opacity:1, y:0, skewX:0, duration:1.0, ease:'power3.out', delay:0.6 });
  gsap.to('.hero-title',  { opacity:1, duration:0.1, delay:0.2 });
  gsap.to('.hero-desc',   { opacity:1, y:0, duration:0.7, ease:'power3.out', delay:0.85 });
  gsap.to('.hero-ctas',   { opacity:1, y:0, duration:0.6, ease:'power3.out', delay:1.0  });
  gsap.fromTo('.hero-scroll', { opacity:0, y:8 }, { opacity:1, y:0, duration:0.5, delay:1.2 });
  gsap.fromTo('#royalNav', { y:-40, opacity:0 }, { y:0, opacity:1, duration:0.7, ease:'power3.out', delay:0.2 });
}

// ── DOM READY ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Nav scroll
  const nav = document.getElementById('royalNav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  // ── Mobile menu toggle
  const toggle  = document.getElementById('mobileToggle');
  const mMenu   = document.getElementById('mobileMenu');
  if (toggle && mMenu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mMenu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    mMenu.querySelectorAll('.mobile-link, a').forEach(l => {
      l.addEventListener('click', () => {
        mMenu.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  // ── Click-based dropdowns (Collections + Profile)
  // Close all dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open, .nav-user-menu.open').forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
    // Close mobile menu too
    if (mMenu && !nav?.contains(e.target)) {
      mMenu.classList.remove('open');
      toggle?.classList.remove('open');
    }
  });

  // ── Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html  = document.documentElement;
      const next  = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(themeToggle, { rotation:-30, scale:0.7 }, { rotation:0, scale:1, duration:0.45, ease:'back.out(2.5)' });
      }
      fetch('/theme', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ theme:next }) });
      showToast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode', 'success');
    });
  }

  // ── Cart drawer
  document.getElementById('cartDrawerOverlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);

  // ── Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCartDrawer(); closeLightbox(); closeProfileModal(); }
  });

  // ── Welcome / bye messages from URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('welcome') === '1') {
    const name = params.get('name');
    const msg  = params.get('newuser') ? `✨ Welcome to the palace!` : `✦ Welcome back${name ? ', ' + name : ''}!`;
    setTimeout(() => showToast(msg, 'success'), 500);
    window.history.replaceState({}, '', window.location.pathname);
  }
  if (params.get('bye') === '1') {
    setTimeout(() => showToast('👋 Hope to see you again soon!', 'success'), 400);
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ── Search suggestions (vault page)
  initSearchSuggestions();

  // ── Password suggestions (register/login page)
  initPasswordSuggestions();

  // ── Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }); return; }
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });

  // ── Section nav smooth scroll
  document.querySelectorAll('.sn-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const href = pill.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const t = document.querySelector(href);
        if (t) t.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });

  // ── Input sanitisation
  document.querySelectorAll('input[type="text"],input[type="email"],textarea').forEach(inp => {
    inp.addEventListener('blur', () => {
      inp.value = inp.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    });
  });

  // ── Double submit prevention
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
      const btn = this.querySelector('[type="submit"]');
      if (btn && !btn.dataset.noLock) {
        setTimeout(() => { btn.disabled = true; }, 10);
      }
    });
  });

});

// ── DROPDOWN TOGGLE ───────────────────────────────────────────
function toggleDropdown(containerId) {
  const el      = document.getElementById(containerId);
  const wasOpen = el.classList.contains('open');
  // Close all
  document.querySelectorAll('.nav-dropdown.open, .nav-user-menu.open').forEach(d => d.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
  // Update aria
  const btn = el.querySelector('button[aria-expanded]');
  if (btn) btn.setAttribute('aria-expanded', !wasOpen);
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3400);
}

// ── CART COUNT ────────────────────────────────────────────────
function updateCartCount(count) {
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── CART: redirect to product (force size selection) ──────────
function quickAddCart(productId) {
  window.location.href = `/product/${productId}`;
}

// ── WISHLIST ──────────────────────────────────────────────────
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

// ── CART DRAWER ───────────────────────────────────────────────
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

// ── LIGHTBOX ──────────────────────────────────────────────────
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (!lb || !img) return;
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── PROFILE MODAL ─────────────────────────────────────────────
function openProfileModal() {
  // Close any open dropdowns first
  document.querySelectorAll('.nav-dropdown.open,.nav-user-menu.open').forEach(d => d.classList.remove('open'));
  document.getElementById('profileModalOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Clear messages
  const err = document.getElementById('profileError');
  const suc = document.getElementById('profileSuccess');
  if (err) err.style.display = 'none';
  if (suc) suc.style.display = 'none';
}
function closeProfileModal() {
  document.getElementById('profileModalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function saveProfile() {
  const name    = document.getElementById('profileName')?.value.trim();
  const currPw  = document.getElementById('currentPw')?.value;
  const newPw   = document.getElementById('newPw')?.value;
  const errEl   = document.getElementById('profileError');
  const sucEl   = document.getElementById('profileSuccess');
  const saveBtn = document.getElementById('saveProfileBtn');

  if (errEl) errEl.style.display = 'none';
  if (sucEl) sucEl.style.display = 'none';

  if (!name) { showProfileMsg('error', 'Name cannot be empty.'); return; }

  const payload = { name };
  if (currPw || newPw) {
    if (!currPw) { showProfileMsg('error', 'Enter your current password to change it.'); return; }
    if (!newPw || newPw.length < 8) { showProfileMsg('error', 'New password must be at least 8 characters.'); return; }
    payload.current_password = currPw;
    payload.new_password     = newPw;
  }

  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

  fetch('/profile/update', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '✦ Save Changes'; }
    if (data.success) {
      showProfileMsg('success', '✓ Profile updated successfully!');
      showToast('✓ Profile updated!', 'success');
      // Update displayed name in nav
      const nameEl = document.querySelector('.nav-user-name');
      if (nameEl && data.name) nameEl.textContent = data.name.split(' ')[0];
      // Clear password fields
      if (document.getElementById('currentPw')) document.getElementById('currentPw').value = '';
      if (document.getElementById('newPw'))     document.getElementById('newPw').value = '';
    } else {
      showProfileMsg('error', data.error || 'Update failed. Try again.');
    }
  })
  .catch(() => {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '✦ Save Changes'; }
    showProfileMsg('error', 'Something went wrong.');
  });
}

function showProfileMsg(type, msg) {
  const el = document.getElementById(type === 'error' ? 'profileError' : 'profileSuccess');
  if (!el) return;
  el.textContent  = msg;
  el.style.display = 'block';
}

// Profile password strength
document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('newPw');
  if (pwInput) {
    pwInput.addEventListener('input', function() {
      const bar = document.getElementById('profilePwBar');
      const lbl = document.getElementById('profilePwLabel');
      if (!bar || !lbl) return;
      scorePassword(this.value, bar, lbl);
    });
  }
});

function scorePassword(v, bar, lbl) {
  let s = 0;
  if (v.length >= 8)           s++;
  if (/[A-Z]/.test(v))         s++;
  if (/[0-9]/.test(v))         s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  const labels = ['','Weak','Fair','Good','Strong'];
  const colors = ['','#e74c3c','#e67e22','#f1c40f','#2ecc71'];
  bar.style.width      = (s * 25) + '%';
  bar.style.background = colors[s] || '';
  lbl.textContent      = labels[s] || '';
}

// ── SEARCH SUGGESTIONS ────────────────────────────────────────
function initSearchSuggestions() {
  const input       = document.querySelector('.filter-search');
  const form        = document.querySelector('.filter-search-form');
  const sugBox      = document.getElementById('searchSuggestions');
  if (!input || !sugBox) return;

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (q.length < 2) { sugBox.classList.remove('open'); return; }
    debounce = setTimeout(() => fetchSuggestions(q, sugBox), 220);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) sugBox.classList.add('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!input.closest('.filter-search-wrap')?.contains(e.target)) {
      sugBox.classList.remove('open');
    }
  });

  // Allow keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') sugBox.classList.remove('open');
  });
}

function fetchSuggestions(q, box) {
  fetch(`/api/search?q=${encodeURIComponent(q)}`)
    .then(r => r.json())
    .then(results => {
      if (!results.length) { box.classList.remove('open'); return; }
      box.innerHTML = `
        <div class="suggestion-header">
          ${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"
          <a href="/vault?search=${encodeURIComponent(q)}">See all →</a>
        </div>
        ${results.map(p => `
          <a href="/product/${p.id}" class="suggestion-item">
            ${p.image_url
              ? `<img src="${p.image_url}" class="suggestion-img" alt="${p.name}" loading="lazy"/>`
              : `<div class="suggestion-img" style="display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:1rem">✦</div>`
            }
            <div class="suggestion-info">
              <span class="suggestion-name">${p.name}</span>
              <span class="suggestion-cat">${p.section || p.category}</span>
            </div>
            <span class="suggestion-price">R${Number(p.price).toLocaleString('en-ZA')}</span>
          </a>
        `).join('')}`;
      box.classList.add('open');
    })
    .catch(() => box.classList.remove('open'));
}

// ── PASSWORD SUGGESTIONS ──────────────────────────────────────
const STRONG_PASSWORDS = [
  'Gold@Palace2026!', 'Royal#Abaya7&', 'Modesty$Queen99',
  'Dream@Abaya2026', 'Jannah#Stars22!', 'Musk&Oud2026@'
];

function initPasswordSuggestions() {
  // Works on both register and login pages
  const pwFields = document.querySelectorAll('input[type="password"][autocomplete="new-password"], #reg-password, #loginPw');
  pwFields.forEach(inp => {
    const wrap = inp.closest('.auth-input-wrap') || inp.parentElement;
    // Check if suggestion box already exists for this field
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
    inp.addEventListener('blur', () => setTimeout(() => sugDiv.classList.remove('show'), 300));
    inp.addEventListener('input', function() {
      // hide suggestions once they start typing their own
      if (this.value.length > 3) sugDiv.classList.remove('show');
      // Update strength bars
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
  inp.type  = 'text'; // briefly show
  setTimeout(() => { inp.type = 'password'; }, 1200);
  // Update strength bars
  const bar = document.getElementById('pwBar');
  const lbl = document.getElementById('pwLabel');
  if (bar && lbl) scorePassword(pw, bar, lbl);
  showToast('✓ Password copied — remember to save it!', 'success');
}

// ── EMAIL DOMAIN VALIDATION ───────────────────────────────────
const VALID_DOMAINS = [
  'gmail.com','yahoo.com','yahoo.co.za','outlook.com','hotmail.com',
  'live.com','icloud.com','me.com','protonmail.com','proton.me',
  'zoho.com','aol.com','mail.com','msn.com','ymail.com',
  'co.za','org.za','gov.za','edu.za','ac.za',  // ZA domains
  'hotmail.co.uk','yahoo.co.uk','btinternet.com','sky.com'
];

function validateEmailDomain(email) {
  if (!email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  // Accept if matches known domain OR has valid TLD structure (x.xx or longer)
  if (VALID_DOMAINS.includes(domain)) return true;
  // Accept company/custom domains with valid structure
  return /^[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?$/.test(domain);
}

// Attach real-time email validation to all email inputs
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

// ── HOME BUTTON — scroll to top on homepage, navigate otherwise ──
document.addEventListener('DOMContentLoaded', function() {
  ['homeNavLink', 'homeMobileLink'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function(e) {
      if (window.location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Close mobile menu if open
        var mm = document.getElementById('mobileMenu');
        if (mm && mm.classList.contains('open')) mm.classList.remove('open');
      }
      // else let the normal href="/" navigate
    });
  });
});
