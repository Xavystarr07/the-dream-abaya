/* ============================================================
   THE DREAM ABAYA — elite.js
   All elite animations: curtain, fireworks, stars, hearts,
   perfume mist, seasonal canvases, sidebar, section reveals
   ============================================================ */

'use strict';

// ── MOCK PRODUCTS for seasonal (pulled from DOM data-* in EJS or re-declared)
// These are referenced by the seasonal section. Passed from EJS via global.
// We'll use a fetch or fallback to empty.

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────
function rand(min, max)  { return Math.random() * (max - min) + min; }
function irand(min, max) { return Math.floor(rand(min, max + 1)); }
function lerp(a, b, t)   { return a + (b - a) * t; }

// ─────────────────────────────────────────────────────────────
// MAIN INIT — called from index.ejs after DOM ready
// ─────────────────────────────────────────────────────────────
function initElitePage() {
  // Wait until reveal is done before running expensive canvas
  document.addEventListener('eliteRevealDone', () => {
    initStarField();
    initFireworks();
    initSidebar();
    initSectionAnimations();
    initCrownsCanvas();
    initPerfumeCanvas();
    initSeasonalCanvases();
    initScrollSections();
    initDreamFloatsCanvas();
    initModestFloatsCanvas();
    initHandbagsCanvas();
    initPerfumesFloatCanvas();
    initVoyageSlider();
  });

  // Fallback: if reveal already done
  setTimeout(() => {
    document.dispatchEvent(new Event('eliteRevealDone'));
  }, 4500);
}

// ─────────────────────────────────────────────────────────────
// MIST REVEAL  (replaces curtain — same event contract)
// Fires 'eliteRevealDone' when dissolve completes
// ─────────────────────────────────────────────────────────────
function initReveal() {
  const overlay = document.getElementById('reveal-overlay');
  if (!overlay || typeof gsap === 'undefined') {
    document.dispatchEvent(new Event('eliteRevealDone'));
    return;
  }

  document.body.style.overflow = 'hidden';

  // ── Mist particle canvas ──────────────────────────────────
  const mistCanvas = document.getElementById('mistCanvas');
  if (mistCanvas) {
    const ctx = mistCanvas.getContext('2d');
    let W, H, motes = [], rafId;

    function resizeMist() {
      W = mistCanvas.width  = mistCanvas.offsetWidth  || window.innerWidth;
      H = mistCanvas.height = mistCanvas.offsetHeight || window.innerHeight;
    }

    // Gold + purple drifting motes
    const PALETTES = [
      [197, 160, 89],   // gold
      [220, 190, 110],  // pale gold
      [140,  80, 200],  // purple
      [100,  60, 180],  // deep purple
      [255, 240, 200],  // ivory
    ];

    function makeMote() {
      const [r, g, b] = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    0.5 + Math.random() * 2.5,
        o:    0.0,
        maxO: 0.08 + Math.random() * 0.25,
        do:   0.004 + Math.random() * 0.008,
        vx:   (Math.random() - 0.5) * 0.4,
        vy:   -0.2 - Math.random() * 0.5, // drift upward
        col:  `${r},${g},${b}`,
        phase: Math.random() > 0.5 ? 1 : -1
      };
    }

    resizeMist();
    for (let i = 0; i < 180; i++) motes.push(makeMote());

    function drawMist() {
      ctx.clearRect(0, 0, W, H);
      motes.forEach(m => {
        m.x  += m.vx;
        m.y  += m.vy;
        m.o  += m.do * m.phase;
        if (m.o >= m.maxO || m.o <= 0) m.phase *= -1;
        // Wrap
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        if (m.x < -10 || m.x > W + 10) m.x = Math.random() * W;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.col},${m.o})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(drawMist);
    }
    drawMist();
    window.addEventListener('resize', resizeMist, { passive: true });
  }

  // ── GSAP timeline — same phase timing as curtain ─────────
  gsap.set('#reveal-text', { opacity: 1, y: 0 });
  gsap.set('.reveal-loading-bar', { width: 0 });

  const tl = gsap.timeline({
    onComplete: () => {
      // Add dissolve class — CSS handles bloom-out animation
      overlay.classList.add('mist-dissolving');
      // After CSS dissolve (1.4s), hide and fire done event
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        document.dispatchEvent(new Event('eliteRevealDone'));
        revealHeroContent();
      }, 1400);
    }
  });

  // PHASE 1 — ornament fades in, loading bar fills (2.8s)
  tl.fromTo('.reveal-ornament', { opacity: 0 }, { opacity: 1, duration: .7, ease: 'power2.out' });
  tl.to('.reveal-loading-bar',  { width: '100%', duration: 2.8, ease: 'power1.inOut' }, '<+=0.2');

  // PHASE 2 — text floats up and fades (mist thickens via CSS)
  tl.to('#reveal-text', { opacity: 0, y: -22, duration: 0.6, ease: 'power2.in' }, '+=0.2');

  // Brief pause then onComplete fires dissolve
  tl.to({}, { duration: 0.3 });
}

function revealHeroContent() {
  if (typeof gsap === 'undefined') return;
  const tl = gsap.timeline();
  tl.to('#heroContent', { opacity:1, duration:.3 });
  tl.fromTo('.hero-eyebrow', { opacity:0, y:15 }, { opacity:1, y:0, duration:.6, ease:'power3.out' });
  tl.fromTo('.hero-word',
    { opacity:0, y:50, rotationX:-20 },
    { opacity:1, y:0, rotationX:0, duration:.9, stagger:.15, ease:'power3.out' }
  );
  tl.fromTo('.hero-word-em',
    { opacity:0, y:40, skewX:-8 },
    { opacity:1, y:0, skewX:0, duration:1.0, ease:'power3.out' },
    '-=.4'
  );
  // Question block appears 1.5s after title
  tl.fromTo('.hero-question',
    { opacity:0, y:30 },
    { opacity:1, y:0, duration:.8, ease:'power3.out' },
    '+=.5'
  );
  tl.to('#heroScroll', { opacity:1, duration:.5 });
}

// ─────────────────────────────────────────────────────────────
// STAR FIELD (realistic, multi-size, twinkle + shooting stars)
// ─────────────────────────────────────────────────────────────
function initStarField() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shooters = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    makeStars();
  }

  function makeStars() {
    stars = [];
    // Layered stars: dim (far), medium, bright (close)
    for (let i = 0; i < 280; i++) {
      const layer = Math.random();
      stars.push({
        x:   rand(0, W),
        y:   rand(0, H * .85),
        r:   layer > .92 ? rand(1.5, 2.8) : layer > .7 ? rand(.8, 1.5) : rand(.2, .8),
        o:   rand(.05, layer > .85 ? .9 : .5),
        do:  rand(.005, .025) * (Math.random() > .5 ? 1 : -1),
        hue: Math.random() > .8 ? `rgba(${irand(200,255)},${irand(180,240)},${irand(220,255)},` : 'rgba(255,255,255,'
      });
    }
    // Purple/blue nebula stars
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: rand(0, W), y: rand(0, H * .7),
        r: rand(.3, 1.2), o: rand(.05, .35), do: rand(.003, .015) * (Math.random() > .5 ? 1 : -1),
        hue: 'rgba(160,120,255,'
      });
    }
  }

  function launchShooter() {
    shooters.push({
      x: rand(W * .1, W * .9), y: rand(0, H * .3),
      vx: rand(-6, -2), vy: rand(1.5, 4),
      len: rand(80, 200), life: 1, decay: rand(.02, .04)
    });
  }

  setInterval(launchShooter, rand(4000, 9000));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      s.o += s.do;
      if (s.o > .95 || s.o < .02) { s.do *= -1; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.hue + s.o + ')';
      ctx.fill();
      // Glow for bright stars
      if (s.r > 1.5 && s.o > .5) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI*2);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*2.5);
        g.addColorStop(0, 'rgba(255,255,230,' + (s.o*.3) + ')');
        g.addColorStop(1, 'rgba(255,255,230,0)');
        ctx.fillStyle = g; ctx.fill();
      }
    });

    // Shooting stars
    shooters = shooters.filter(s => {
      s.life -= s.decay;
      if (s.life <= 0) return false;
      const x2 = s.x - s.vx * 12;
      const y2 = s.y - s.vy * 12;
      const g = ctx.createLinearGradient(s.x, s.y, x2, y2);
      g.addColorStop(0, 'rgba(255,255,255,' + s.life * .9 + ')');
      g.addColorStop(.5, 'rgba(197,160,89,' + s.life * .5 + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x2, y2);
      ctx.strokeStyle = g; ctx.lineWidth = s.life * 1.8;
      ctx.stroke();
      s.x += s.vx; s.y += s.vy;
      return true;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// FIREWORKS  (Disney style — burst, sparkle, colour variety)
// ─────────────────────────────────────────────────────────────
function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  let rockets = [], bursts = [], sparkles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  const COLOURS = [
    '#C5A059','#FFF8E7','#A78BFA','#60A5FA','#F472B6',
    '#34D399','#FB923C','#E879F9','#F9A8D4','#FCD34D'
  ];

  function launchRocket() {
    const x     = rand(W * .12, W * .88);
    const destY = rand(H * .08, H * .38);
    rockets.push({
      x, y: H - 10,
      destY,
      vx: rand(-1, 1),
      speed: rand(5, 9),
      trail: [],
      color: COLOURS[irand(0, COLOURS.length-1)]
    });
  }

  function explode(x, y, color) {
    const count = irand(70, 120);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(-.1, .1);
      const spd   = rand(1.5, 7.5);
      const isGold = Math.random() < .25;
      bursts.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        decay: rand(.012, .028),
        r: rand(1.5, 3.5),
        color: isGold ? '#C5A059' : color,
        gravity: .06,
        tail: []
      });
    }
    // Sparkle ring
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      sparkles.push({
        x, y,
        vx: Math.cos(angle) * rand(8, 14),
        vy: Math.sin(angle) * rand(8, 14),
        life: 1, decay: rand(.04, .07),
        color: '#FFF8E7', r: rand(1, 2.2)
      });
    }
    // Star-burst shimmer (4-point star)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      sparkles.push({
        x, y,
        vx: Math.cos(angle) * rand(4, 9),
        vy: Math.sin(angle) * rand(4, 9),
        life: 1, decay: rand(.02, .04),
        color: '#C5A059', r: rand(2, 4), star: true
      });
    }
  }

  // Staggered launch schedule — not spam
  const schedule = [0, 1200, 2600, 3900, 5100, 6500, 8000, 9500, 11000, 12800];
  schedule.forEach(t => setTimeout(launchRocket, t));
  // Repeat loop
  function repeatLaunches() {
    const gaps = [1400, 2000, 1800, 2400, 1600, 2200, 1900, 2500];
    let total = 0;
    gaps.forEach(g => {
      total += g;
      setTimeout(launchRocket, total);
    });
    setTimeout(repeatLaunches, total + 3000);
  }
  setTimeout(repeatLaunches, 14000);

  function drawStar(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const ai = a + Math.PI / 4;
      if (i === 0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      ctx.lineTo(Math.cos(ai)*(r*.35), Math.sin(ai)*(r*.35));
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Rockets
    rockets = rockets.filter(r => {
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 12) r.trail.shift();
      const dy = r.destY - r.y;
      const dx = r.destY < r.y ? r.vx : 0;
      r.y -= r.speed;
      r.x += dx * .15;

      // Draw trail
      r.trail.forEach((pt, i) => {
        const a = (i / r.trail.length) * .7;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2 - i*.1, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,220,100,' + a + ')';
        ctx.fill();
      });
      // Draw head
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.5, 0, Math.PI*2);
      ctx.fillStyle = r.color;
      ctx.shadowColor = r.color; ctx.shadowBlur = 8;
      ctx.fill(); ctx.shadowBlur = 0;

      if (r.y <= r.destY) {
        explode(r.x, r.y, r.color);
        return false;
      }
      return true;
    });

    // Burst particles
    bursts = bursts.filter(b => {
      b.life -= b.decay;
      if (b.life <= 0) return false;
      b.tail.push({ x: b.x, y: b.y });
      if (b.tail.length > 5) b.tail.shift();
      b.x += b.vx; b.y += b.vy;
      b.vx *= .97; b.vy *= .97;
      b.vy += b.gravity;

      // Fading tail
      b.tail.forEach((pt, i) => {
        const a = (i / b.tail.length) * b.life * .6;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, b.r * .5, 0, Math.PI*2);
        ctx.fillStyle = b.color.replace('rgb', 'rgba').replace(')', `,${a})`);
        if (!b.color.includes('rgba')) {
          ctx.globalAlpha = a;
          ctx.fillStyle = b.color;
        }
        ctx.fill(); ctx.globalAlpha = 1;
      });

      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI*2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = b.life * .9;
      ctx.fill(); ctx.globalAlpha = 1;
      return true;
    });

    // Sparkles
    sparkles = sparkles.filter(s => {
      s.life -= s.decay;
      if (s.life <= 0) return false;
      s.x += s.vx; s.y += s.vy;
      s.vx *= .95; s.vy *= .95; s.vy += .04;
      if (s.star) {
        drawStar(ctx, s.x, s.y, s.r * s.life * 1.5, s.color, s.life);
      } else {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI*2);
        ctx.fillStyle = s.color; ctx.globalAlpha = s.life * .8;
        ctx.fill(); ctx.globalAlpha = 1;
      }
      return true;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// HEARTS CANVAS  (aesthetic section — floating hearts)
// ─────────────────────────────────────────────────────────────
function initHeartsCanvas() {
  const canvas = document.getElementById('heartsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, hearts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    makeHearts();
  }

  const HEART_COLORS = [
    'rgba(167,139,250,', 'rgba(196,181,253,', 'rgba(197,160,89,',
    'rgba(248,187,208,', 'rgba(240,171,252,', 'rgba(255,255,255,'
  ];

  function makeHearts() {
    hearts = Array.from({ length: 55 }, () => ({
      x: rand(0, W), y: rand(0, H),
      size: rand(6, 28),
      vx: rand(-.5, .5), vy: rand(-.8, -.2),
      o: rand(.1, .65),
      do: rand(.003, .012) * (Math.random() > .5 ? 1 : -1),
      rot: rand(-30, 30), drot: rand(-.3, .3),
      color: HEART_COLORS[irand(0, HEART_COLORS.length-1)]
    }));
  }

  function drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(hearts[0] ? 0 : 0); // will use individual
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color + alpha + ')';
    ctx.beginPath();
    ctx.moveTo(0, size * .35);
    ctx.bezierCurveTo(-size, -size * .15, -size * 1.1, size * .55, 0, size * 1.1);
    ctx.bezierCurveTo(size * 1.1, size * .55, size, -size * .15, 0, size * .35);
    ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    hearts.forEach(h => {
      h.x  += h.vx; h.y += h.vy;
      h.o  += h.do;
      h.rot += h.drot;
      if (h.o > .7 || h.o < .05) h.do *= -1;
      if (h.y < -50) { h.y = H + 20; h.x = rand(0, W); }
      if (h.x < -50 || h.x > W+50) { h.x = rand(0,W); }
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot * Math.PI / 180);
      ctx.globalAlpha = h.o;
      ctx.fillStyle = h.color + '1)';
      ctx.beginPath();
      const s = h.size;
      ctx.moveTo(0, s * .35);
      ctx.bezierCurveTo(-s, -s*.15, -s*1.1, s*.55, 0, s*1.1);
      ctx.bezierCurveTo(s*1.1, s*.55, s, -s*.15, 0, s*.35);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// PERFUME MIST CANVAS  (spray particles + ambient sparkles)
// ─────────────────────────────────────────────────────────────
function initPerfumeCanvas() {
  // Perfumes section: ethereal mist wisps + glowing scent orbs
  const canvas = document.getElementById('perfumeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, wisps = [], orbs = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    makeWisps(); makeOrbs();
  }

  // elite.js — Update the SCENT_COLORS to use RGBA prefixes
const SCENT_COLORS = [
  ['rgba(167,139,250,','rgba(139,92,246,'],
  ['rgba(244,114,182,','rgba(219,39,119,'],
  ['rgba(197,160,89,', 'rgba(161,122,50,'], // FIXED: Was hex, now rgba prefix
  ['rgba(186,230,253,','rgba(125,211,252,'],
  ['rgba(240,171,252,','rgba(192,132,252,'],
];

// In elite.js inside draw(), the existing concatenation will now work correctly:
// g.addColorStop(0, o.color + (o.o*1.8).toFixed(2)+')'); 
// Results in: "rgba(197,160,89,0.28)"
// elite.js - Update these arrays to use RGBA prefixes
const HANDBAG_COLORS = [
  'rgba(197,160,89,',  // Gold (Fixed from #C5A059)
  'rgba(167,139,250,',  // Purple
  'rgba(244,114,182,',  // Pink
  'rgba(255,255,255,'   // White
];

const CROWN_COLORS = [
  'rgba(255,215,0,',    // Bright Gold
  'rgba(197,160,89,',   // Deep Gold
  'rgba(255,248,231,',  // Cream
  'rgba(167,139,250,'   // Lavender
];

  function makeWisps() {
    wisps = Array.from({ length: 16 }, () => {
      const [c1, c2] = SCENT_COLORS[irand(0, SCENT_COLORS.length-1)];
      return {
        // Wisp is drawn as a chain of soft bezier curves
        x: rand(W*.1, W*.9), y: rand(H*.1, H*.9),
        cx: rand(0, W), cy: rand(0, H),
        vx: rand(-.3, .3), vy: rand(-.7, -.1),
        dcx: rand(-.5,.5), dcy: rand(-.4,.4),
        w: rand(12, 40), h: rand(40, 120),
        o: rand(.06, .25), do: rand(.002,.006)*(Math.random()>.5?1:-1),
        c1, c2, rot: rand(0,360), drot: rand(-.3,.3)
      };
    });
  }

  function makeOrbs() {
    orbs = Array.from({ length: 8 }, () => {
      const [c1] = SCENT_COLORS[irand(0, SCENT_COLORS.length-1)];
      return {
        x: rand(W*.1, W*.9), y: rand(H*.1, H*.9),
        vx: rand(-.2,.2), vy: rand(-.4,-.05),
        r: rand(8, 28),
        o: rand(.08, .3), do: rand(.002,.005)*(Math.random()>.5?1:-1),
        color: c1, pulse: rand(0, Math.PI*2), dpulse: rand(.02,.05)
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Glow orbs
    orbs.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      o.o += o.do; if (o.o>.32||o.o<.05) o.do*=-1;
      o.pulse += o.dpulse;
      if (o.y < -30) { o.y = H+20; o.x=rand(W*.1,W*.9); }
      const r = o.r * (1 + Math.sin(o.pulse)*0.18);
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r*3.5);
      g.addColorStop(0,   o.color + (o.o*1.8).toFixed(2)+')');
      g.addColorStop(0.4, o.color + o.o.toFixed(2)+')');
      g.addColorStop(1,   o.color + '0)');
      ctx.beginPath(); ctx.arc(o.x, o.y, r*3.5, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
      // Bright centre
      ctx.beginPath(); ctx.arc(o.x, o.y, r*.35, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,' + (o.o*1.5).toFixed(2)+')'; ctx.fill();
    });

    // Mist wisps
    wisps.forEach(w => {
      w.x += w.vx; w.y += w.vy;
      w.cx += w.dcx; w.cy += w.dcy;
      w.rot += w.drot;
      w.o += w.do; if (w.o>.28||w.o<.04) w.do*=-1;
      if (w.y < -w.h) { w.y = H+20; w.x=rand(W*.1,W*.9); }
      if (w.cx<0||w.cx>W) w.dcx*=-1;

      ctx.save(); ctx.translate(w.x, w.y); ctx.rotate(w.rot*Math.PI/180);
      // Multiple overlapping ellipses = wisp shape
      for (let i=0; i<3; i++) {
        const ox = (i-.5)*w.w*.4, oy = i*w.h*.25;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, w.w*.7);
        g.addColorStop(0, w.c1 + (w.o*(1-.2*i)).toFixed(3)+')');
        g.addColorStop(0.5, w.c2 + (w.o*.5).toFixed(3)+')');
        g.addColorStop(1, w.c1+'0)');
        ctx.beginPath(); ctx.ellipse(ox, oy, w.w*.7, w.h*.3, 0, 0, Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.restore(); ctx.globalAlpha=1;
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

function initSeasonalCanvases() {
  initSummerCanvas();
  initAutumnCanvas();
  initWinterCanvas();
  initSpringCanvas();
}

function initSummerCanvas() {
  const c = document.getElementById('summerCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const cx = W / 2, cy = H * 0.42;
  const NUM_RAYS = 20;
  const rays = Array.from({length: NUM_RAYS}, (_, i) => ({
    angle: (i / NUM_RAYS) * Math.PI * 2,
    len:   32 + Math.random() * 22,
    w:     1.2 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2
  }));
  // Heat shimmer particles
  const sparks = Array.from({length:12}, () => ({
    x: cx + (Math.random()-.5)*30, y: cy + (Math.random()-.5)*30,
    vx: (Math.random()-.5)*.8, vy: -(.5 + Math.random()*.8),
    r: .8+Math.random()*2, o: .3+Math.random()*.4, life:1
  }));
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.022;

    // Warm background haze
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * .56);
    bg.addColorStop(0, 'rgba(255,200,30,0.18)');
    bg.addColorStop(.5, 'rgba(255,140,0,0.07)');
    bg.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Outer corona glow
    const corona = ctx.createRadialGradient(cx, cy, 14, cx, cy, 52);
    corona.addColorStop(0,   'rgba(255,220,60,0.35)');
    corona.addColorStop(0.6, 'rgba(255,170,0,0.12)');
    corona.addColorStop(1,   'rgba(255,120,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI*2);
    ctx.fillStyle = corona; ctx.fill();

    // Rays — thick, warm, wobbling
    rays.forEach((r, i) => {
      const a   = r.angle + t * 0.35;
      const len = r.len + Math.sin(t * 2.1 + r.phase) * 8;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      const g = ctx.createLinearGradient(16, 0, 16+len, 0);
      g.addColorStop(0,   'rgba(255,220,40,0.92)');
      g.addColorStop(0.4, 'rgba(255,180,0,0.55)');
      g.addColorStop(1,   'rgba(255,140,0,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = r.w + Math.sin(t*1.4 + i*.5)*.6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(16+len,0);
      ctx.stroke(); ctx.restore();
    });

    // Sun core — rich warm yellow-orange
    const sunG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    sunG.addColorStop(0,   'rgba(255,255,180,1)');
    sunG.addColorStop(0.3, 'rgba(255,230,40,0.95)');
    sunG.addColorStop(0.7, 'rgba(255,180,0,0.85)');
    sunG.addColorStop(1,   'rgba(245,120,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2);
    ctx.fillStyle = sunG; ctx.fill();

    // Bright highlight
    ctx.beginPath(); ctx.arc(cx-4, cy-4, 6, 0, Math.PI*2);
    ctx.fillStyle='rgba(255,255,230,0.7)'; ctx.fill();

    // Heat sparkles
    sparks.forEach(s => {
      s.x += s.vx + Math.sin(t*3+s.y*.1)*.3;
      s.y += s.vy;
      s.life -= .018;
      if (s.life <= 0 || s.y < cy-45) {
        s.x=cx+(Math.random()-.5)*20; s.y=cy+10+(Math.random()*12);
        s.vx=(Math.random()-.5)*.6; s.vy=-(.4+Math.random()*.7);
        s.r=.7+Math.random()*2; s.life=.7+Math.random()*.5;
      }
      ctx.globalAlpha = s.life * s.o;
      ctx.fillStyle='rgba(255,240,80,1)';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

function initAutumnCanvas() {
  const c = document.getElementById('autumnCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  const LEAF_COLORS = [
    '#D97706', '#B45309', '#EA580C', '#DC2626', '#92400E', '#F59E0B'
  ];

  const leaves = Array.from({length: 16}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.7, vy: 0.4 + Math.random() * 0.9,
    rot: Math.random() * 360, drot: (Math.random() - 0.5) * 3,
    w: 7 + Math.random() * 10, h: 5 + Math.random() * 8,
    color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    sway: Math.random() * Math.PI * 2, swaySpeed: 0.02 + Math.random() * 0.02
  }));

  function drawLeaf(ctx, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    // Maple-like leaf shape
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(-w * 0.6, h * 0.4, -w * 0.8, -h * 0.1, 0, -h);
    ctx.bezierCurveTo(w * 0.8, -h * 0.1, w * 0.6, h * 0.4, 0, h);
    ctx.closePath();
    ctx.fill();
    // Stem
    ctx.strokeStyle = 'rgba(120,60,20,0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h + 4); ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    leaves.forEach(l => {
      l.sway += l.swaySpeed;
      l.x += l.vx + Math.sin(l.sway) * 0.4;
      l.y += l.vy;
      l.rot += l.drot;
      if (l.y > H + 20) { l.y = -15; l.x = Math.random() * W; }
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot * Math.PI / 180);
      ctx.globalAlpha = 0.82;
      drawLeaf(ctx, l.w, l.h, l.color);
      ctx.restore(); ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }

  // Draw centered autumn icon (tree silhouette)
  function drawTreeIcon() {
    const cx = W / 2, cy = H / 2;
    // Trunk
    ctx.fillStyle = 'rgba(120,60,20,0.4)';
    ctx.fillRect(cx - 3, cy + 5, 6, 25);
    // Canopy blobs
    const blobs = [
      [cx, cy - 10, 18, '#D97706'],
      [cx - 14, cy, 13, '#EA580C'],
      [cx + 14, cy, 13, '#B45309'],
      [cx, cy + 2, 15, '#F59E0B']
    ];
    blobs.forEach(([bx, by, br, col]) => {
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = col + '55'; ctx.fill();
    });
  }

  draw();
}

function initWinterCanvas() {
  const c = document.getElementById('winterCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  const flakes = Array.from({length: 28}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vy: 0.25 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.3,
    r: 2 + Math.random() * 5, o: 0.3 + Math.random() * 0.5,
    rot: 0, rotSpeed: (Math.random() - 0.5) * 0.8,
    arms: 6
  }));

  function drawSnowflake(ctx, r, o) {
    ctx.globalAlpha = o;
    ctx.strokeStyle = 'rgba(186,230,253,0.95)';
    for (let i = 0; i < 6; i++) {
      // Main arm
      ctx.lineWidth = r > 4 ? 1.2 : 0.8;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 2.6); ctx.stroke();
      // Side branches
      const bLen = r * 0.9;
      const bPos = r * 1.5;
      ctx.lineWidth = r > 4 ? 0.8 : 0.5;
      ctx.beginPath(); ctx.moveTo(0, -bPos); ctx.lineTo(-bLen * 0.7, -bPos - bLen * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -bPos); ctx.lineTo(bLen * 0.7, -bPos - bLen * 0.5); ctx.stroke();
      // Inner branches
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-bLen * 0.4, -r - bLen * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(bLen * 0.4, -r - bLen * 0.35); ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
    // Centre dot
    ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(219,234,254,0.8)'; ctx.fill();
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => {
      f.x += f.vx; f.y += f.vy;
      f.rot += f.rotSpeed;
      if (f.y > H + 10) { f.y = -8; f.x = Math.random() * W; }
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot * Math.PI / 180);
      drawSnowflake(ctx, f.r, f.o);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

function initSpringCanvas() {
  const c = document.getElementById('springCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;

  const PETAL_COLORS = [
    '#F472B6', '#E879F9', '#FDA4AF', '#C084FC', '#FCA5A5', '#FBCFE8'
  ];

  const petals = Array.from({length: 20}, () => ({
    x: Math.random() * W, y: H * 0.3 + Math.random() * H * 0.7,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -(0.4 + Math.random() * 0.7),
    rot: Math.random() * 360, drot: (Math.random() - 0.5) * 2.5,
    w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    sway: Math.random() * Math.PI * 2
  }));

  function drawPetal(ctx, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.45, h, 0, 0, Math.PI * 2);
    ctx.fill();
    // Petal sheen
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.1, -h * 0.2, w * 0.15, h * 0.45, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.sway += 0.025;
      p.x += p.vx + Math.sin(p.sway) * 0.35;
      p.y += p.vy;
      p.rot += p.drot;
      if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = 0.78;
      drawPetal(ctx, p.w, p.h, p.color);
      ctx.restore(); ctx.globalAlpha = 1;
    });

    // Draw centred cherry blossom
    const cx = W / 2, cy = H / 2;
    // Branch
    ctx.strokeStyle = 'rgba(101,60,50,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 20, cy + 15); ctx.quadraticCurveTo(cx, cy - 5, cx + 20, cy + 10); ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────────────
// SEASONAL SELECTION
// ─────────────────────────────────────────────────────────────
const SEASON_DATA = {
  summer: {
    icon: '☀️',
    title: 'Summer Collection',
    poem: 'Light breathes through linen,\nsun-kissed and free —\na modest glow in the golden heat.',
    bg: 'linear-gradient(135deg, #1A1000 0%, #2D1800 40%, #1A0E00 100%)',
    accent: '#FCD34D',
    categories: ['aesthetic', 'accessories']
  },
  autumn: {
    icon: '🍂',
    title: 'Autumn Collection',
    poem: 'Copper leaves and amber light,\nwarm layers wrapped with grace —\nthe season of rich, quiet beauty.',
    bg: 'linear-gradient(135deg, #1A0800 0%, #2D1200 40%, #180A00 100%)',
    accent: '#F97316',
    categories: ['modest', 'accessories']
  },
  winter: {
    icon: '❄️',
    title: 'Winter Collection',
    poem: 'Velvet silence, crystal cold,\nroyal depths and midnight hues —\nwear the season\'s quiet power.',
    bg: 'linear-gradient(135deg, #020815 0%, #061230 40%, #040A20 100%)',
    accent: '#93C5FD',
    categories: ['dream', 'hijabs']
  },
  spring: {
    icon: '🌸',
    title: 'Spring Collection',
    poem: 'Petals unfold in soft morning light,\npastel and petal, bloom and grace —\nspringtime dressed in modesty.',
    bg: 'linear-gradient(135deg, #100520 0%, #1A0A35 40%, #0E0520 100%)',
    accent: '#F0ABFC',
    categories: ['modest', 'aesthetic', 'perfumes']
  }
};

function selectSeason(season) {
  const data    = SEASON_DATA[season];
  const chooser = document.getElementById('seasonChooser');
  const display = document.getElementById('seasonDisplay');
  const section = document.getElementById('section-seasonal');
  if (!data || !chooser || !display) return;

  // Update display content
  document.getElementById('sdIcon').textContent  = data.icon;
  document.getElementById('sdTitle').textContent = data.title;
  document.getElementById('sdPoem').innerHTML    = data.poem.replace(/\n/g, '<br/>');
  document.getElementById('seasonViewAll').href  = `/vault?category=${data.categories[0]}`;

  // Change section background
  if (section) section.style.background = data.bg;

  // Load season products from page products (filter by category)
  const container = document.getElementById('seasonProducts');
  if (container) {
    // Clone product cards that match the season's categories
    const allCards = Array.from(document.querySelectorAll('.product-card'));
    container.innerHTML = '';
    const matching = [];
    allCards.forEach(card => {
      const catEl = card.querySelector('.product-card-cat');
      if (!catEl) return;
      const catText = catEl.textContent.toLowerCase();
      const matches = data.categories.some(cat =>
        catText.includes(cat) || card.closest(`#section-${cat}`) !== null
      );
      if (matches && matching.length < 4) {
        matching.push(card.cloneNode(true));
      }
    });
    if (matching.length === 0) {
      // Fallback: grab any 4 cards
      allCards.slice(0, 4).forEach(c => container.appendChild(c.cloneNode(true)));
    } else {
      matching.forEach(c => container.appendChild(c));
    }
  }

  // Animate transition
  if (typeof gsap !== 'undefined') {
    gsap.to(chooser, { opacity:0, y:-30, duration:.4, ease:'power2.in', onComplete: () => {
      chooser.style.display = 'none';
      display.style.display = 'block';
      gsap.fromTo(display, { opacity:0, y:30 }, { opacity:1, y:0, duration:.6, ease:'power3.out' });
    }});
  } else {
    chooser.style.display = 'none';
    display.style.display = 'block';
  }

  // Start immersive season particles
  startSeasonImmersiveCanvas(season);
}

function closeSeason() {
  const chooser = document.getElementById('seasonChooser');
  const display = document.getElementById('seasonDisplay');
  const section = document.getElementById('section-seasonal');
  if (!chooser || !display) return;
  if (section) section.style.background = '';

  // Stop immersive season particles
  stopSeasonImmersiveCanvas();

  if (typeof gsap !== 'undefined') {
    gsap.to(display, { opacity:0, y:20, duration:.35, ease:'power2.in', onComplete: () => {
      display.style.display = 'none';
      chooser.style.display = 'flex';
      gsap.fromTo(chooser, { opacity:0 }, { opacity:1, duration:.5, ease:'power2.out' });
    }});
  } else {
    display.style.display = 'none';
    chooser.style.display = 'flex';
  }
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR — track active section
// ─────────────────────────────────────────────────────────────
function initSidebar() {
  const links = document.querySelectorAll('.sb-link');
  if (!links.length) return;

  const sections = [];
  links.forEach(l => {
    const id = l.getAttribute('href')?.replace('#','');
    if (id) {
      const el = document.getElementById(id);
      if (el) sections.push({ el, link: l });
    }
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sections.forEach(s => s.link.classList.toggle('active', s.el === entry.target));
      }
    });
  }, { threshold: .3 });

  sections.forEach(s => obs.observe(s.el));

  // Smooth scroll on click
  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const id = l.getAttribute('href')?.replace('#','');
      document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// SECTION SCROLL ANIMATIONS  (GSAP ScrollTrigger)
// ─────────────────────────────────────────────────────────────
function initSectionAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Generic section content panels
  gsap.utils.toArray('.section-content-panel').forEach(el => {
    gsap.fromTo(el,
      { opacity:0, x:60 },
      { opacity:1, x:0, duration:1, ease:'power3.out',
        scrollTrigger: { trigger: el, start:'top 75%', once:true } }
    );
  });

  // Seasonal intro
  const sIntro = document.getElementById('seasonalIntro');
  if (sIntro) {
    gsap.fromTo(sIntro,
      { opacity:0, y:40 },
      { opacity:1, y:0, duration:.9, ease:'power3.out',
        scrollTrigger: { trigger:'#section-seasonal', start:'top 65%', once:true } }
    );
  }
  const sChooser = document.getElementById('seasonChooser');
  if (sChooser) {
    gsap.fromTo(sChooser.children,
      { opacity:0, y:50, scale:.9 },
      { opacity:1, y:0, scale:1, duration:.7, stagger:.12, ease:'back.out(1.4)',
        scrollTrigger: { trigger:'#section-seasonal', start:'top 55%', once:true } }
    );
  }

  // Reveal blocks (story)
  gsap.utils.toArray('.reveal-block').forEach(el => {
    gsap.fromTo(el,
      { opacity:0, y:45 },
      { opacity:1, y:0, duration:.9, ease:'power3.out',
        scrollTrigger: { trigger:el, start:'top 80%', once:true } }
    );
  });

  // Product cards
  gsap.utils.toArray('.product-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity:0, y:30, scale:.96 },
      { opacity:1, y:0, scale:1, duration:.6, delay:(i%4)*.07, ease:'power3.out',
        scrollTrigger: { trigger:el, start:'top 88%', once:true } }
    );
  });
}

// ─────────────────────────────────────────────────────────────
// SCROLL SECTION TRACKER  (for active sidebar + section bg)
// ─────────────────────────────────────────────────────────────
function initScrollSections() {
  // Passive scroll watcher
}


// ─────────────────────────────────────────────────────────────
// SECTION 2 — DREAM FLOATS (soft clouds + golden petals)
// ─────────────────────────────────────────────────────────────
function initDreamFloatsCanvas() {
  const canvas = document.getElementById('dreamFloatsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, clouds = [], petals = [];

  function resize() {
    const stage = canvas.parentElement;
    W = canvas.width  = stage.offsetWidth  || 300;
    H = canvas.height = stage.offsetHeight || 600;
    makeClouds(); makePetals();
  }

  function makeClouds() {
    clouds = Array.from({ length: 8 }, () => ({
      x: rand(0, W), y: rand(H * .1, H * .8),
      w: rand(60, 140), h: rand(25, 55),
      vx: rand(.1, .4), vy: rand(-.05, .05),
      o: rand(.06, .18), do: rand(.001, .004) * (Math.random() > .5 ? 1 : -1)
    }));
  }

  function makePetals() {
    petals = Array.from({ length: 22 }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-.3, .3), vy: rand(-.6, -.15),
      rot: rand(0, 360), drot: rand(-1.5, 1.5),
      size: rand(5, 14), o: rand(.3, .7),
      color: ['rgba(197,160,89,', 'rgba(255,248,231,', 'rgba(212,186,126,'][irand(0,2)]
    }));
  }

  function drawCloud(c) {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w * .7);
    g.addColorStop(0, `rgba(180,200,255,${c.o})`);
    g.addColorStop(.6, `rgba(140,170,240,${c.o * .5})`);
    g.addColorStop(1, 'rgba(100,140,220,0)');
    ctx.save();
    ctx.scale(1, c.h / c.w);
    ctx.beginPath(); ctx.arc(c.x, c.y * (c.w / c.h), c.w * .7, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    clouds.forEach(c => {
      c.x += c.vx; c.y += c.vy;
      c.o += c.do; if (c.o > .2 || c.o < .04) c.do *= -1;
      if (c.x > W + c.w) c.x = -c.w;
      drawCloud(c);
    });
    petals.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.drot;
      if (p.y < -20) { p.y = H + 10; p.x = rand(0, W); }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.o;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * .4, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '1)'; ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// SECTION 3 — MODEST FLOATS (flowers + blossom petals)
// ─────────────────────────────────────────────────────────────
function initModestFloatsCanvas() {
  const canvas = document.getElementById('modestFloatsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, blossoms = [], petals = [];

  function resize() {
    const stage = canvas.parentElement;
    W = canvas.width  = stage.offsetWidth  || 300;
    H = canvas.height = stage.offsetHeight || 600;
    makeBlossoms(); makePetals();
  }

  function makeBlossoms() {
    blossoms = Array.from({ length: 5 }, () => ({
      x: rand(W * .1, W * .9), y: rand(H * .1, H * .85),
      r: rand(14, 32), rot: rand(0, 360), drot: rand(-.2, .2),
      o: rand(.12, .35), do: rand(.002, .006) * (Math.random() > .5 ? 1 : -1),
      color: ['#F472B6','#C084FC','#FDA4AF','#A78BFA'][irand(0, 3)]
    }));
  }

  function makePetals() {
    petals = Array.from({ length: 28 }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-.4, .4), vy: rand(-.5, -.1),
      rot: rand(0, 360), drot: rand(-2, 2),
      w: rand(6, 16), h: rand(4, 10),
      o: rand(.4, .8),
      color: ['rgba(244,114,182,', 'rgba(192,132,252,', 'rgba(253,164,175,', 'rgba(167,139,250,'][irand(0,3)]
    }));
  }

  function drawBlossom(b) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot * Math.PI / 180);
    ctx.globalAlpha = b.o;
    for (let i = 0; i < 5; i++) {
      ctx.save(); ctx.rotate((i / 5) * Math.PI * 2);
      ctx.beginPath(); ctx.ellipse(0, -b.r * .6, b.r * .3, b.r * .6, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color; ctx.fill(); ctx.restore();
    }
    // Centre
    ctx.beginPath(); ctx.arc(0, 0, b.r * .22, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF8E7'; ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    blossoms.forEach(b => {
      b.rot += b.drot; b.o += b.do;
      if (b.o > .38 || b.o < .08) b.do *= -1;
      drawBlossom(b);
    });
    petals.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.drot;
      if (p.y < -20) { p.y = H + 10; p.x = rand(0, W); }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.o;
      ctx.beginPath(); ctx.ellipse(0, 0, p.w * .4, p.h, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '1)'; ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// SECTION 4 — SILVER CROWNS CANVAS (replaces hearts)
// ─────────────────────────────────────────────────────────────
function initCrownsCanvas() {
  // Aesthetic section: floating crystal diamonds + clean geometric particles
  const canvas = document.getElementById('crownsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, crystals = [], lines = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    makeCrystals();
  }

  const CRYSTAL_COLORS = [
    'rgba(197,160,89,',   // gold
    'rgba(220,220,230,',  // silver
    'rgba(180,220,255,',  // ice blue
    'rgba(240,220,180,',  // warm cream
  ];

  function makeCrystals() {
    crystals = Array.from({ length: 28 }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-.25, .25), vy: rand(-.5, -.1),
      rot: rand(0, 360), drot: rand(-.5, .5),
      size: rand(6, 22),
      o: rand(.1, .5), do: rand(.003, .009) * (Math.random()>.5?1:-1),
      color: CRYSTAL_COLORS[irand(0, CRYSTAL_COLORS.length-1)],
      sides: [4,6,8][irand(0,2)]  // diamond / hexagon / octagon
    }));
    // Subtle grid lines
    lines = Array.from({ length: 8 }, () => ({
      x1: rand(0, W), y1: rand(0, H),
      x2: rand(0, W), y2: rand(0, H),
      o: rand(.02, .06), do: rand(.001,.003)*(Math.random()>.5?1:-1)
    }));
  }

  function drawCrystal(c) {
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot * Math.PI / 180);
    ctx.globalAlpha = c.o;
    const s = c.size;
    // Draw polygon
    ctx.beginPath();
    for (let i = 0; i < c.sides; i++) {
      const a = (i / c.sides) * Math.PI * 2 - Math.PI/2;
      i===0 ? ctx.moveTo(Math.cos(a)*s, Math.sin(a)*s)
            : ctx.lineTo(Math.cos(a)*s, Math.sin(a)*s);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0,0,0,0,0,s);
    g.addColorStop(0,   c.color + (c.o*2).toFixed(2) + ')');
    g.addColorStop(0.5, c.color + c.o.toFixed(2) + ')');
    g.addColorStop(1,   c.color + '0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = c.color + (c.o*.8).toFixed(2) + ')';
    ctx.lineWidth = .8; ctx.stroke();
    // Inner shimmer line
    ctx.beginPath(); ctx.moveTo(-s*.3, -s*.5); ctx.lineTo(s*.2, s*.4);
    ctx.strokeStyle = 'rgba(255,255,255,' + (c.o*.6).toFixed(2) + ')';
    ctx.lineWidth = .6; ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Subtle connecting lines
    lines.forEach(l => {
      l.o += l.do; if (l.o>.07||l.o<.01) l.do*=-1;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2);
      ctx.strokeStyle = 'rgba(197,160,89,'+l.o.toFixed(3)+')';
      ctx.lineWidth = .5; ctx.stroke();
    });
    crystals.forEach(c => {
      c.x += c.vx; c.y += c.vy; c.rot += c.drot;
      c.o += c.do; if (c.o>.52||c.o<.06) c.do*=-1;
      if (c.y < -30) { c.y = H+15; c.x = rand(0,W); }
      if (c.x < -30 || c.x > W+30) c.x = rand(0,W);
      drawCrystal(c);
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// SECTION 5 — FLOATING HANDBAGS CANVAS (replaces hijabi)
// ─────────────────────────────────────────────────────────────
function initHandbagsCanvas() {
  // Hijabs section: flowing silk ribbons + floating star points
  const canvas = document.getElementById('handbagsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, ribbons = [], stars = [];

  function resize() {
    const stage = canvas.parentElement;
    W = canvas.width  = stage.offsetWidth  || 300;
    H = canvas.height = stage.offsetHeight || 600;
    makeRibbons(); makeStars();
  }

  const SILK_COLORS = [
    ['rgba(167,139,250,','rgba(124,58,237,'],   // violet
    ['rgba(196,181,253,','rgba(139,92,246,'],   // lavender
    ['rgba(197,160,89,', '#C5A059'],            // gold
    ['rgba(240,171,252,','rgba(192,132,252,'],  // pink-purple
    ['rgba(186,230,253,','rgba(99,179,237,'],   // ice
  ];

  function makeRibbons() {
    ribbons = Array.from({ length: 14 }, () => {
      const [c1, c2] = SILK_COLORS[irand(0, SILK_COLORS.length-1)];
      return {
        // Control points for bezier ribbon
        x: rand(0, W), y: rand(0, H),
        vx: rand(-.4, .4), vy: rand(-.6, -.1),
        cp1x: rand(-40, 40), cp1y: rand(-60, 60),
        cp2x: rand(-40, 40), cp2y: rand(-60, 60),
        dcp: rand(-.8, .8),
        len: rand(60, 130), width: rand(3, 10),
        rot: rand(0, 360), drot: rand(-.4, .4),
        o: rand(.2, .65), do: rand(.004,.01)*(Math.random()>.5?1:-1),
        c1, c2
      };
    });
  }

  function makeStars() {
    stars = Array.from({ length: 22 }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-.2,.2), vy: rand(-.4,-.08),
      size: rand(3, 12), pts: 4,
      o: rand(.15,.55), do: rand(.003,.009)*(Math.random()>.5?1:-1),
      rot: rand(0,360), drot: rand(-.6,.6),
      color: Math.random()>.5 ? 'rgba(197,160,89,' : 'rgba(210,190,255,'
    }));
  }

  function drawStar(x, y, r, pts, color, alpha) {
    ctx.save(); ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let i = 0; i < pts*2; i++) {
      const a = (i / (pts*2)) * Math.PI * 2 - Math.PI/2;
      const rad = i%2===0 ? r : r*.42;
      i===0 ? ctx.moveTo(Math.cos(a)*rad, Math.sin(a)*rad)
            : ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0,0,0,0,0,r);
    g.addColorStop(0, color+(alpha*1.4).toFixed(2)+')');
    g.addColorStop(1, color+'0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.restore(); ctx.globalAlpha=1;
  }

 /**
 * FIXED drawRibbon
 * Includes inline Hex-to-RGBA conversion to prevent ReferenceErrors
 */
function drawRibbon(r) {
  // --- INLINE HELPER ---
  // This replaces the need for an external hexToRGBA function
  const toRGBA = (c) => {
    if (typeof c === 'string' && c.startsWith('#')) {
      let hex = c.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
      const rgba = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ].join(',');
      return `rgba(${rgba},`;
    }
    return c; // Already in prefix format
  };

  ctx.save(); 
  ctx.translate(r.x, r.y); 
  ctx.rotate(r.rot * Math.PI / 180);
  ctx.globalAlpha = r.o;

  const g = ctx.createLinearGradient(0, 0, r.cp1x, r.len);
  
  // Apply the conversion to c1 and c2 safely
  const color1 = toRGBA(r.c1);
  const color2 = toRGBA(r.c2);

  // FIXED: These now produce valid strings regardless of whether input was hex or rgba
  g.addColorStop(0,   color1 + '0)'); 
  g.addColorStop(0.3, color1 + r.o.toFixed(2) + ')');
  g.addColorStop(0.7, color2 + r.o.toFixed(2) + ')');
  g.addColorStop(1,   color1 + '0)');

  ctx.strokeStyle = g;
  ctx.lineWidth = r.width;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    r.cp1x, r.cp1y, 
    r.cp2x, r.len * 0.6 + r.cp2y, 
    r.cp1x * 0.5, r.len
  );
  ctx.stroke();

  ctx.restore(); 
  ctx.globalAlpha = 1;
}

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ribbons.forEach(r => {
      r.x += r.vx; r.y += r.vy; r.rot += r.drot;
      r.cp1x += r.dcp*.12; r.cp2x -= r.dcp*.08;
      if (r.cp1x > 50||r.cp1x < -50) r.dcp *= -1;
      r.o += r.do; if (r.o>.68||r.o<.12) r.do*=-1;
      if (r.y < -r.len) { r.y = H+20; r.x = rand(0,W); }
      drawRibbon(r);
    });
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.rot += s.drot;
      s.o += s.do; if (s.o>.58||s.o<.1) s.do*=-1;
      if (s.y < -20) { s.y = H+15; s.x=rand(0,W); }
      ctx.save(); ctx.rotate(s.rot*Math.PI/180);
      drawStar(s.x, s.y, s.size, s.pts, s.color, s.o);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// SECTION 6 — FLOATING PERFUME BOTTLES CANVAS (replaces walker)
// ─────────────────────────────────────────────────────────────
function initPerfumesFloatCanvas() {
  // Accessories section: gold dust trails + glittering sparkle bursts
  const canvas = document.getElementById('perfumesFloatCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dustParticles = [], sparkBursts = [], trails = [];

  function resize() {
    const stage = canvas.parentElement;
    W = canvas.width  = stage.offsetWidth  || 300;
    H = canvas.height = stage.offsetHeight || 600;
    makeDust(); makeTrails();
  }

  function makeDust() {
    dustParticles = Array.from({ length: 60 }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-.5, .5), vy: rand(-.8, -.15),
      r: rand(.8, 3.5),
      o: rand(.2, .75), do: rand(.005,.015)*(Math.random()>.5?1:-1),
      color: Math.random()>.45
        ? 'rgba(197,160,89,'
        : Math.random()>.5 ? 'rgba(255,230,120,' : 'rgba(255,255,210,'
    }));
  }

  function makeTrails() {
    trails = Array.from({ length: 5 }, () => ({
      x: rand(W*.1, W*.9), y: rand(H*.1, H*.85),
      angle: rand(0, Math.PI*2),
      speed: rand(.8, 2.2),
      length: rand(40, 90),
      history: [],
      o: rand(.3, .6), do: rand(.003,.008)*(Math.random()>.5?1:-1),
      timer: 0
    }));
  }

  // Occasional sparkle burst
  function spawnBurst(x, y) {
    const count = irand(6, 12);
    for (let i = 0; i < count; i++) {
      const angle = (i/count)*Math.PI*2 + rand(0,.5);
      const speed = rand(1, 3.5);
      sparkBursts.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        r: rand(1, 3), life: 1,
        decay: rand(.025,.06),
        color: Math.random()>.5 ? 'rgba(255,230,60,' : 'rgba(197,160,89,'
      });
    }
  }

  let burstTimer = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    burstTimer++;
    if (burstTimer > 90) {
      burstTimer = 0;
      spawnBurst(rand(W*.15, W*.85), rand(H*.15, H*.85));
    }

    // Gold dust
    dustParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.o += p.do; if (p.o>.78||p.o<.1) p.do*=-1;
      if (p.y < -10) { p.y = H+5; p.x = rand(0,W); }
      if (p.x < -5 || p.x > W+5) p.x = rand(0,W);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*2.5);
      g.addColorStop(0, p.color + p.o.toFixed(2)+')');
      g.addColorStop(1, p.color + '0)');
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r*2.5, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    });

    // Trailing streaks
    trails.forEach(t => {
      t.angle += rand(-.04,.04);
      t.x += Math.cos(t.angle)*t.speed;
      t.y += Math.sin(t.angle)*t.speed;
      t.o += t.do; if (t.o>.65||t.o<.15) t.do*=-1;
      t.history.push({x:t.x, y:t.y});
      if (t.history.length > t.length) t.history.shift();
      if (t.x<0||t.x>W||t.y<0||t.y>H) {
        t.x=rand(W*.2,W*.8); t.y=rand(H*.2,H*.8);
        t.angle=rand(0,Math.PI*2); t.history=[];
      }
      if (t.history.length > 2) {
        ctx.beginPath(); ctx.moveTo(t.history[0].x, t.history[0].y);
        for (let i=1; i<t.history.length; i++) ctx.lineTo(t.history[i].x, t.history[i].y);
        const frac = t.history.length / t.length;
        ctx.strokeStyle = 'rgba(197,160,89,' + (t.o * frac * .55).toFixed(3) + ')';
        ctx.lineWidth = 1.2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
      }
    });

    // Sparkle bursts
    sparkBursts = sparkBursts.filter(s => {
      s.x += s.vx; s.y += s.vy; s.vy += .05;
      s.life -= s.decay;
      if (s.life <= 0) return false;
      const a = s.life * .85;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*2);
      g.addColorStop(0, s.color + a.toFixed(2)+')');
      g.addColorStop(1, s.color+'0)');
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r*2, 0, Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      return true;
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}

// ─────────────────────────────────────────────────────────────
// SECTION 7 — SEASONAL IMMERSIVE CANVAS (full-screen overlay)
// ─────────────────────────────────────────────────────────────
let seasonImmersiveAnimId = null;
let seasonImmersiveParticles = [];

function startSeasonImmersiveCanvas(season) {
  const canvas = document.getElementById('seasonImmersiveCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  // Size to the section, not the full window
  const section = document.getElementById('section-seasonal');
  const W = canvas.width  = section ? section.offsetWidth  : window.innerWidth;
  const H = canvas.height = section ? section.offsetHeight : window.innerHeight;

  seasonImmersiveParticles = [];
  if (seasonImmersiveAnimId) cancelAnimationFrame(seasonImmersiveAnimId);

  // Spawn particles based on season
  function spawnParticles() {
    if (season === 'summer') {
      // Sunbeam rays from top
      for (let i = 0; i < 18; i++) {
        seasonImmersiveParticles.push({
          type: 'ray',
          angle: rand(-0.6, 0.6),
          cx: rand(W * .2, W * .8), cy: -10,
          len: rand(H * .35, H * .75),
          w: rand(8, 28),
          o: rand(.04, .12), do: rand(.001, .003) * (Math.random()>.5?1:-1),
          life: 1, decay: 0
        });
      }
      // Rising golden sparkles
      for (let i = 0; i < 90; i++) {
        const warm = Math.random();
        seasonImmersiveParticles.push({
          type: 'spark',
          x: rand(0, W), y: rand(H * .3, H * 1.2),
          vx: rand(-1, 1), vy: rand(-3.5, -1.2),
          r: rand(1.5, 5), o: rand(.4, .9), life: rand(.5, 1),
          color: warm > .6 ? 'rgba(255,230,40,' : warm > .3 ? 'rgba(255,180,0,' : 'rgba(255,255,180,',
          decay: rand(.006, .016)
        });
      }
      // Floating sun-motes (large soft glows)
      for (let i = 0; i < 14; i++) {
        seasonImmersiveParticles.push({
          type: 'mote',
          x: rand(0, W), y: rand(0, H),
          vx: rand(-.4, .4), vy: rand(-.8, -.2),
          r: rand(18, 55), o: rand(.06, .16), life: 1, decay: 0
        });
      }
    } else if (season === 'autumn') {
      // Falling leaves
      for (let i = 0; i < 70; i++) {
        const colors = ['rgba(217,119,6,','rgba(180,83,9,','rgba(234,88,12,','rgba(220,38,38,','rgba(245,158,11,'];
        seasonImmersiveParticles.push({
          x: rand(-50, W + 50), y: rand(-H, 0),
          vx: rand(-1, 1.5), vy: rand(1.5, 4),
          rot: rand(0, 360), drot: rand(-3, 3),
          w: rand(10, 22), h: rand(7, 16),
          o: rand(.5, .9), life: 1, decay: 0,
          color: colors[irand(0, colors.length - 1)]
        });
      }
    } else if (season === 'winter') {
      // Snowflakes
      for (let i = 0; i < 80; i++) {
        seasonImmersiveParticles.push({
          x: rand(0, W), y: rand(-H, 0),
          vx: rand(-.5, .5), vy: rand(.5, 2),
          rot: 0, drot: rand(-.5, .5),
          r: rand(3, 10), o: rand(.4, .9), life: 1, decay: 0,
          color: 'rgba(186,230,253,'
        });
      }
    } else if (season === 'spring') {
      // Cherry blossom petals
      const pcols = ['rgba(244,114,182,','rgba(192,132,252,','rgba(253,164,175,','rgba(240,171,252,'];
      for (let i = 0; i < 80; i++) {
        seasonImmersiveParticles.push({
          x: rand(0, W), y: rand(H, H * 1.5),
          vx: rand(-.8, .8), vy: rand(-3, -1),
          rot: rand(0, 360), drot: rand(-2, 2),
          w: rand(8, 18), h: rand(5, 12),
          o: rand(.5, .9), life: 1, decay: 0,
          color: pcols[irand(0, pcols.length - 1)]
        });
      }
    }
  }

  spawnParticles();

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    let allDead = true;

    seasonImmersiveParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.decay) { p.life -= p.decay; if (p.life <= 0) return; }
      allDead = false;

      if (season === 'summer') {
        if (p.type === 'ray') {
          ctx.save();
          ctx.translate(p.cx, p.cy); ctx.rotate(p.angle);
          const g = ctx.createLinearGradient(0, 0, 0, p.len);
          g.addColorStop(0,   'rgba(255,230,40,' + p.o + ')');
          g.addColorStop(0.6, 'rgba(255,180,0,' + p.o*.4 + ')');
          g.addColorStop(1,   'rgba(255,140,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.rect(-p.w/2, 0, p.w, p.len); ctx.fill();
          p.o += p.do; if (p.o > .14 || p.o < .02) p.do *= -1;
          ctx.restore();
        } else if (p.type === 'mote') {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0,   'rgba(255,220,60,' + p.o + ')');
          g.addColorStop(0.5, 'rgba(255,160,0,' + p.o*.4 + ')');
          g.addColorStop(1,   'rgba(255,120,0,0)');
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = g; ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.y < -p.r*2) { p.y = H + p.r; p.x = rand(0, W); }
        } else {
          // spark
          if (p.decay) { p.life -= p.decay; if (p.life <= 0) return; }
          const a = p.life * p.o;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*1.8);
          g.addColorStop(0,   p.color + a + ')');
          g.addColorStop(0.5, p.color + a*.5 + ')');
          g.addColorStop(1,   p.color + '0)');
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r*1.8, 0, Math.PI*2);
          ctx.fillStyle = g; ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.y < -20) { p.y = H + 10; p.x = rand(0,W); p.life=.7+Math.random()*.4; }
        }
      } else if (season === 'autumn') {
        // Leaf
        p.rot += p.drot;
        if (p.y > H + 30) p.y = rand(-100, -20);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.color + '1)';
        ctx.beginPath(); ctx.ellipse(0, 0, p.w * .4, p.h, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
      } else if (season === 'winter') {
        // Snowflake
        p.rot += p.drot;
        if (p.y > H + 20) p.y = rand(-60, 0);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.strokeStyle = p.color + p.o + ')'; ctx.lineWidth = p.r > 7 ? 1.2 : .8;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p.r * 2.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -p.r * 1.5); ctx.lineTo(-p.r * .7, -p.r * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -p.r * 1.5); ctx.lineTo(p.r * .7, -p.r * 2); ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }
        ctx.restore();
      } else if (season === 'spring') {
        // Petal
        p.rot += p.drot;
        if (p.y < -30) p.y = H + 20;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.color + '1)';
        ctx.beginPath(); ctx.ellipse(0, 0, p.w * .4, p.h, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
      }
    });

    seasonImmersiveAnimId = requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

function stopSeasonImmersiveCanvas() {
  if (seasonImmersiveAnimId) {
    cancelAnimationFrame(seasonImmersiveAnimId);
    seasonImmersiveAnimId = null;
  }
  const canvas = document.getElementById('seasonImmersiveCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }
}

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
