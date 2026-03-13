// ─────────────────────────────────────────────────────────────
// FIREWORKS  (Disney style — burst, sparkle, colour variety)
// ─────────────────────────────────────────────────────────────

'use strict';

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