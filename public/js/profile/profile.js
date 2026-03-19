// ── PROFILE MODAL ─────────────────────────────────────────────
function openProfileModal() {
  const overlay = document.getElementById('profileModalOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Clear previous messages
  document.getElementById('profileError').style.display   = 'none';
  document.getElementById('profileSuccess').style.display = 'none';
}

function closeProfileModal() {
  const overlay = document.getElementById('profileModalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

async function saveProfile() {
  const name       = document.getElementById('profileName')?.value.trim();
  const currentPw  = document.getElementById('currentPw')?.value;
  const newPw      = document.getElementById('newPw')?.value;
  const errEl      = document.getElementById('profileError');
  const successEl  = document.getElementById('profileSuccess');
  const btn        = document.getElementById('saveProfileBtn');

  errEl.style.display     = 'none';
  successEl.style.display = 'none';

  // Basic validation
  if (!name) {
    errEl.textContent    = 'Name cannot be empty.';
    errEl.style.display  = 'block';
    return;
  }
  if (newPw && !currentPw) {
    errEl.textContent   = 'Enter your current password to set a new one.';
    errEl.style.display = 'block';
    return;
  }
  if (newPw && newPw.length < 8) {
    errEl.textContent   = 'New password must be at least 8 characters.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Saving…';

  try {
    const res  = await fetch('/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ name, current_password: currentPw, new_password: newPw })
    });
    const data = await res.json();

    if (data.success) {
      successEl.textContent    = '✓ Profile updated successfully!';
      successEl.style.display  = 'block';

      // Update name in nav without page reload
      document.querySelectorAll('.nav-user-name').forEach(el => {
        el.textContent = data.name.split(' ')[0];
      });
      document.querySelectorAll('.nav-user-avatar').forEach(el => {
        el.textContent = data.name.charAt(0).toUpperCase();
      });
      document.querySelectorAll('.profile-modal-avatar').forEach(el => {
        el.textContent = data.name.charAt(0).toUpperCase();
      });

      // Clear password fields
      if (document.getElementById('currentPw')) document.getElementById('currentPw').value = '';
      if (document.getElementById('newPw'))     document.getElementById('newPw').value = '';

      showToast('Profile updated ✦', 'success');
      setTimeout(closeProfileModal, 1800);
    } else {
      errEl.textContent   = data.error || 'Something went wrong.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.textContent   = 'Network error. Please try again.';
    errEl.style.display = 'block';
  } finally {
    btn.disabled    = false;
    btn.textContent = '✦ Save Changes';
  }
}

// Password strength indicator in profile modal
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('newPw')?.addEventListener('input', function () {
    const v   = this.value;
    const bar = document.getElementById('profilePwBar');
    const lbl = document.getElementById('profilePwLabel');
    if (!bar || !lbl) return;
    const score = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)]
      .filter(Boolean).length;
    const colors = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    bar.style.width      = (score * 25) + '%';
    bar.style.background = colors[score];
    lbl.textContent      = labels[score];
  });
});