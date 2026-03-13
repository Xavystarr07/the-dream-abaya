'use strict';
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