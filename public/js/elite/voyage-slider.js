'use strict';
// ─────────────────────────────────────────────────────────────
// HERO SCROLL TO SECTION (for q-choice onclick attr)
// ─────────────────────────────────────────────────────────────
function scrollToSection(id) {
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
  }, 80);
}

// ─────────────────────────────────────────────────────────────
// VOYAGE CARD SLIDER  (hero "what are you searching for" CTA)
// ─────────────────────────────────────────────────────────────
function initVoyageSlider() {
  const wrapper   = document.getElementById('voyageCards');
  const bgEl      = document.getElementById('voyageBg');
  const infoList  = document.getElementById('voyageInfoList');
  const btnPrev   = document.getElementById('voyagePrev');
  const btnNext   = document.getElementById('voyageNext');
  if (!wrapper || !btnPrev || !btnNext) return;

  // States: current, next, previous, extra (hidden 4th)
  const STATES = ['current--card','next--card','previous--card','extra--card'];
  const INFO_STATES = ['current--info','next--info','previous--info','extra--info'];
  const BG_STATES   = ['current--image','next--image','previous--image','extra--image'];

  // Get ordered card elements
  function getCards() { return Array.from(wrapper.querySelectorAll('.voyage-card')); }
  function getInfos() { return infoList ? Array.from(infoList.querySelectorAll('.voyage-info')) : []; }
  function getBgs()   { return bgEl    ? Array.from(bgEl.querySelectorAll('.voyage-app__bg__image')) : []; }

  function applyClasses(els, classes) {
    els.forEach((el, i) => {
      el.className = el.className.replace(/\b(current|next|previous|extra)--\w+\b/g, '');
      if (classes[i]) el.classList.add(classes[i]);
    });
  }

  // Rotate arrays left (next) or right (prev)
  function rotate(arr, dir) {
    const copy = [...arr];
    if (dir === 'next')  { copy.push(copy.shift()); }
    else                 { copy.unshift(copy.pop()); }
    return copy;
  }

  let cards = getCards();
  let infos = getInfos();
  let bgs   = getBgs();
  let locked = false;

  function swap(dir) {
    if (locked) return;
    locked = true;

    // Animate info out
    const curInfo = infoList && infoList.querySelector('.current--info');
    if (curInfo && typeof gsap !== 'undefined') {
      gsap.to(curInfo.querySelectorAll('.voyage-text'), {
        duration: .3, y: '-40px', opacity: 0, stagger: .06,
        onComplete: swapClasses
      });
    } else { swapClasses(); }

    function swapClasses() {
      cards = rotate(cards, dir);
      infos = rotate(infos, dir);
      bgs   = rotate(bgs,   dir);

      applyClasses(cards, STATES);
      applyClasses(infos, INFO_STATES);
      applyClasses(bgs,   BG_STATES);

      // Show new current info
      const newInfo = infoList && infoList.querySelector('.current--info');
      if (newInfo) {
        newInfo.style.display = 'block';
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(newInfo.querySelectorAll('.voyage-text'),
            { y: '30px', opacity: 0 },
            { duration: .35, y: '0', opacity: 1, stagger: .06, onComplete: () => { locked = false; } }
          );
        } else { locked = false; }
      } else { locked = false; }

      // Hide non-current infos
      infos.forEach(inf => {
        if (!inf.classList.contains('current--info')) inf.style.display = 'none';
      });
    }
  }

  btnNext.addEventListener('click', () => swap('next'));
  btnPrev.addEventListener('click', () => swap('prev'));

  // Click on card: if current, navigate; else shift to it
  wrapper.addEventListener('click', e => {
    const card = e.target.closest('.voyage-card');
    if (!card) return;
    if (card.classList.contains('current--card')) {
      const href = card.dataset.href;
      if (!href) return;
      if (href.startsWith('#')) {
        const id = href.slice(1);
        document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
      } else { window.location.href = href; }
    } else if (card.classList.contains('next--card')) {
      swap('next');
    } else if (card.classList.contains('previous--card')) {
      swap('prev');
    }
  });

  // Mouse tilt on current card
  function updateTilt(e) {
    const card = wrapper.querySelector('.current--card');
    if (!card) return;
    const box = card.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const angle = Math.atan2(e.clientX - cx, 0) * (30 / Math.PI);
    if (typeof gsap !== 'undefined') {
      gsap.set(card, { '--card-ry': `${angle}deg` });
    }
  }
  function resetTilt(e) {
    const card = wrapper.querySelector('.current--card');
    if (card && typeof gsap !== 'undefined') gsap.set(card, { '--card-ry': '0deg' });
  }
  wrapper.addEventListener('pointermove', updateTilt);
  wrapper.addEventListener('pointerout',  resetTilt);

  // Initial entrance animation
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(cards,
      { '--card-ty': '100vh' },
      { '--card-ty': '0vh', duration: .7, stagger: { from:'right', amount:.15 }, ease:'power3.out',
        delay: .2 }
    );
    const curInfo = infoList && infoList.querySelector('.current--info');
    if (curInfo) {
      gsap.fromTo(curInfo.querySelectorAll('.voyage-text'),
        { y: '30px', opacity: 0 },
        { y: '0', opacity: 1, duration: .4, stagger: .08, delay: .6 }
      );
    }
  }
}