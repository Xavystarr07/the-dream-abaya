'use strict';
// ─────────────────────────────────────────────────────────────
// SECTION 4 — SILVER CROWNS CANVAS
// ─────────────────────────────────────────────────────────────

// ── Inline helpers ───────────────────────────────────────────
function _r(mn, mx)  { return Math.random() * (mx - mn) + mn; }
function _ir(mn, mx) { return Math.floor(_r(mn, mx + 1)); }

function initCrownsCanvas() {
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
    'rgba(197,160,89,',
    'rgba(220,220,230,',
    'rgba(180,220,255,',
    'rgba(240,220,180,',
  ];

  function makeCrystals() {
    crystals = Array.from({ length: 28 }, () => ({
      x: _r(0, W), y: _r(0, H),
      vx: _r(-.25, .25), vy: _r(-.5, -.1),
      rot: _r(0, 360), drot: _r(-.5, .5),
      size: _r(6, 22),
      o: _r(.1, .5), do: _r(.003, .009) * (Math.random()>.5?1:-1),
      color: CRYSTAL_COLORS[_ir(0, CRYSTAL_COLORS.length-1)],
      sides: [4,6,8][_ir(0,2)]
    }));
    lines = Array.from({ length: 8 }, () => ({
      x1: _r(0, W), y1: _r(0, H),
      x2: _r(0, W), y2: _r(0, H),
      o: _r(.02, .06), do: _r(.001,.003)*(Math.random()>.5?1:-1)
    }));
  }

  function drawCrystal(c) {
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot * Math.PI / 180);
    ctx.globalAlpha = c.o;
    const s = c.size;
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
    ctx.beginPath(); ctx.moveTo(-s*.3, -s*.5); ctx.lineTo(s*.2, s*.4);
    ctx.strokeStyle = 'rgba(255,255,255,' + (c.o*.6).toFixed(2) + ')';
    ctx.lineWidth = .6; ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    lines.forEach(l => {
      l.o += l.do; if (l.o>.07||l.o<.01) l.do*=-1;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2);
      ctx.strokeStyle = 'rgba(197,160,89,'+l.o.toFixed(3)+')';
      ctx.lineWidth = .5; ctx.stroke();
    });
    crystals.forEach(c => {
      c.x += c.vx; c.y += c.vy; c.rot += c.drot;
      c.o += c.do; if (c.o>.52||c.o<.06) c.do*=-1;
      if (c.y < -30) { c.y = H+15; c.x = _r(0,W); }
      if (c.x < -30 || c.x > W+30) c.x = _r(0,W);
      drawCrystal(c);
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize(); draw();
}
