/* ============================================================
   ELITE FIXES v3 — elite-fixes.js
   - Correct heart bezier path on canvas
   - Inject crown background decorations into hijabs section
   - Hero sequence timing
   ============================================================ */
'use strict';

// ── INJECT CROWN DECORATIONS into hijabs section ──────────
(function injectCrowns() {
  const section = document.getElementById('section-hijabs');
  if (!section) return;

  // Background scattered crowns
  const bgDecor = document.createElement('div');
  bgDecor.className = 'crown-bg-decor';
  for (let i = 0; i < 10; i++) {
    const span = document.createElement('span');
    span.className = 'cb-crown';
    span.textContent = '♛';
    bgDecor.appendChild(span);
  }
  section.insertBefore(bgDecor, section.firstChild);

  // Prominent accents
  const accents = [
    { cls: 'crown-accent crown-accent-1', text: '♛' },
    { cls: 'crown-accent crown-accent-2', text: '♕' },
    { cls: 'crown-accent crown-accent-3', text: '♛' }
  ];
  accents.forEach(a => {
    const el = document.createElement('span');
    el.className = a.cls; el.textContent = a.text;
    section.appendChild(el);
  });
})();

// ── HEARTS CANVAS OVERRIDE — proper heart shape ───────────
// This replaces the initHeartsCanvas defined in elite.js
// by patching the draw function with a correct heart bezier path.
(function patchHearts() {
  // We patch after elite.js runs, by overriding the canvas draw
  // The correct heart uses:
  //   moveTo centre-bottom
  //   bezierCurveTo for left half
  //   bezierCurveTo for right half
  const originalInit = window.initHeartsCanvas;

  function drawProperHeart(ctx, cx, cy, size, color, alpha) {
    // Classic heart parametric approximation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    // Start at bottom tip
    ctx.moveTo(0, size * 0.8);
    // Left side: bottom-tip → left-lobe top
    ctx.bezierCurveTo(
      -size * 1.2, size * 0.3,   // cp1
      -size * 1.4, -size * 0.6,  // cp2
      0,           -size * 0.4   // end (top centre dip)
    );
    // Right side: top centre → right-lobe → bottom tip
    ctx.bezierCurveTo(
      size * 1.4, -size * 0.6,   // cp1
      size * 1.2,  size * 0.3,   // cp2
      0,           size * 0.8    // end back at bottom
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Monkey-patch the hearts canvas after DOM is ready
  function patchHeartsCanvas() {
    const canvas = document.getElementById('heartsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const HEART_COLORS = [
      [167, 139, 250], [196, 181, 253], [197, 160, 89],
      [248, 187, 208], [240, 171, 252], [255, 255, 255]
    ];

    const hearts = Array.from({ length: 50 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(Math.random() * 0.6 + 0.25),
      size: Math.random() * 14 + 7,
      o: Math.random() * 0.5 + 0.1,
      do: (Math.random() * 0.008 + 0.003) * (Math.random() > .5 ? 1 : -1),
      rot: (Math.random() - 0.5) * 20,
      drot: (Math.random() - 0.5) * 0.4,
      colIdx: Math.floor(Math.random() * HEART_COLORS.length)
    }));

    let animRunning = false;

    function startDraw() {
      if (animRunning) return;
      animRunning = true;

      function draw() {
        ctx.clearRect(0, 0, W, H);
        hearts.forEach(h => {
          h.x += h.vx; h.y += h.vy;
          h.o += h.do; h.rot += h.drot;
          if (h.o > 0.7 || h.o < 0.05) h.do *= -1;
          if (h.y < -30) { h.y = H + 20; h.x = Math.random() * W; }
          if (h.x < -30 || h.x > W + 30) { h.x = Math.random() * W; }

          const [r, g, b] = HEART_COLORS[h.colIdx];
          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.rotate(h.rot * Math.PI / 180);
          ctx.globalAlpha = h.o;

          // Correct heart path
          const s = h.size;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.9);
          ctx.bezierCurveTo(-s * 1.15, s * 0.25, -s * 1.35, -s * 0.5, 0, -s * 0.3);
          ctx.bezierCurveTo(s * 1.35, -s * 0.5, s * 1.15, s * 0.25, 0, s * 0.9);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
        });
        requestAnimationFrame(draw);
      }
      draw();
    }

    // Start when section comes into view
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) startDraw(); });
    }, { threshold: 0.1 });
    const aestheticSection = document.getElementById('section-aesthetic');
    if (aestheticSection) obs.observe(aestheticSection);
    else startDraw();

    window.addEventListener('resize', () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }, { passive: true });
  }

  // Run after elite.js initialises
  document.addEventListener('eliteRevealDone', () => {
    setTimeout(patchHeartsCanvas, 200);
  });
  setTimeout(patchHeartsCanvas, 5000); // fallback
})();

// ── SEASONAL CANVAS — ensure icon renders centred ─────────
// The icons are HTML elements positioned over the canvas via CSS
// This ensures the canvas doesn't obscure them
(function fixSeasonalIcons() {
  const cards = document.querySelectorAll('.season-card');
  cards.forEach(card => {
    const canvas = card.querySelector('.season-mini-canvas');
    const icon   = card.querySelector('.season-icon');
    if (!canvas || !icon) return;
    // Put canvas behind everything
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    // Ensure icon is on top
    icon.style.zIndex = '5';
    icon.style.position = 'relative';
  });
})();
