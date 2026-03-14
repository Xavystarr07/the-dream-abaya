'use strict';
var _r  = _r  || function(mn,mx){ return Math.random()*(mx-mn)+mn; };
var _ir = _ir || function(mn,mx){ return Math.floor(_r(mn,mx+1)); };

function initStarField() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, rafId = null;
  let stars = [], shooters = [], nebula = [];
  let paused = false;

  function resize() {
    // Use offsetWidth if available, else keep existing canvas.width (set by primeCanvases), else window
    W = canvas.width  = canvas.offsetWidth  || canvas.width  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || canvas.height || window.innerHeight;
    makeStars(); makeNebula();
  }

  // ── STARS — 3 depth layers ──────────────────────────────────
  function makeStars() {
    stars = [];

    // Layer 1 — distant faint stars (many, tiny)
    for (let i = 0; i < 320; i++) {
      stars.push({
        x: _r(0,W), y: _r(0,H),
        r: _r(.15,.5),
        o: _r(.08,.35), do: _r(.003,.009) * (Math.random()>.5?1:-1),
        hue: 'rgba(200,210,255,',   // slightly blue-white — distant
        twinkle: false,
      });
    }

    // Layer 2 — mid stars
    for (let i = 0; i < 180; i++) {
      const warm = Math.random() > .65;
      stars.push({
        x: _r(0,W), y: _r(0,H*.9),
        r: _r(.4,1.1),
        o: _r(.18,.55), do: _r(.004,.014) * (Math.random()>.5?1:-1),
        hue: warm ? 'rgba(255,230,180,' : 'rgba(220,230,255,',
        twinkle: Math.random() > .6,
        twinklePhase: _r(0, Math.PI*2),
        twinkleSpeed: _r(.02,.06),
      });
    }

    // Layer 3 — bright foreground stars with diffraction spikes
    for (let i = 0; i < 28; i++) {
      const col = ['rgba(255,245,210,','rgba(180,210,255,','rgba(255,200,160,'][_ir(0,2)];
      stars.push({
        x: _r(0,W), y: _r(0,H*.85),
        r: _r(1.2, 2.5),
        o: _r(.5,.9), do: _r(.006,.018) * (Math.random()>.5?1:-1),
        hue: col,
        twinkle: true,
        twinklePhase: _r(0, Math.PI*2),
        twinkleSpeed: _r(.03,.08),
        spike: true,   // draw diffraction cross
      });
    }

    // Purple/blue star clusters — Milky Way feel
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: _r(W*.2, W*.8), y: _r(0, H*.6),
        r: _r(.2,.7),
        o: _r(.05,.2), do: _r(.002,.007) * (Math.random()>.5?1:-1),
        hue: 'rgba(180,150,255,',
        twinkle: false,
      });
    }
  }

  // ── NEBULA — soft static glow patches ──────────────────────
  function makeNebula() {
    nebula = Array.from({length: 5}, () => ({
      x: _r(W*.05, W*.95), y: _r(H*.05, H*.7),
      rx: _r(80,220), ry: _r(40,120),
      o: _r(.012,.04),
      color: ['rgba(120,60,200,','rgba(40,60,160,','rgba(80,40,140,'][_ir(0,2)],
    }));
  }

  // ── SHOOTING STARS ──────────────────────────────────────────
  function launchShooter() {
    if (paused) return;
    const angle = _r(.18, .45);   // diagonal, not too steep
    const speed = _r(7, 14);
    shooters.push({
      x: _r(W*.05, W*.85), y: _r(0, H*.45),
      vx: -Math.cos(angle) * speed,
      vy:  Math.sin(angle) * speed,
      len: _r(100,260),
      life: 1, decay: _r(.018,.036),
      width: _r(.6,1.4),
    });
  }
  // Random shooting stars — 1 every 5-12s
  function scheduleShooter() {
    launchShooter();
    setTimeout(scheduleShooter, _r(5000,12000));
  }
  setTimeout(scheduleShooter, _r(1500,4000));

  // ── PAUSE/RESUME ────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      paused = false;
      if (!rafId) draw();
    }
  });

  document.addEventListener('heroSlideChange', e => {
    if (e.detail.isFireworks) {
      paused = false; if (!rafId) draw();
    } else {
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
  });

  // ── DRAW ────────────────────────────────────────────────────
  function draw() {
    if (paused) { rafId = null; return; }
    rafId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    // Nebula patches
    nebula.forEach(n => {
      const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.rx);
      g.addColorStop(0, n.color + n.o + ')');
      g.addColorStop(1, n.color + '0)');
      ctx.save(); ctx.scale(1, n.ry/n.rx);
      ctx.beginPath(); ctx.arc(n.x, n.y*(n.rx/n.ry), n.rx, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    });

    // Stars
    stars.forEach(s => {
      let o = s.o;
      if (s.twinkle) {
        s.twinklePhase += s.twinkleSpeed;
        o = s.o + Math.sin(s.twinklePhase) * s.o * .55;
        o = Math.max(0, Math.min(1, o));
      } else {
        s.o += s.do;
        if (s.o > .95 || s.o < .01) s.do *= -1;
        o = s.o;
      }

      // Core dot
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.hue + o + ')'; ctx.fill();

      // Glow halo on bright stars
      if (s.r > .9 && o > .3) {
        const g = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*3.5);
        g.addColorStop(0, s.hue + (o*.3) + ')');
        g.addColorStop(1, s.hue + '0)');
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r*3.5, 0, Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
      }

      // Diffraction spikes on bright stars
      if (s.spike && o > .4) {
        const len = s.r * 5 * o;
        ctx.strokeStyle = s.hue + (o*.5) + ')';
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(s.x-len,s.y); ctx.lineTo(s.x+len,s.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x,s.y-len); ctx.lineTo(s.x,s.y+len); ctx.stroke();
      }
    });

    // Shooting stars
    shooters = shooters.filter(s => {
      s.life -= s.decay; if (s.life <= 0) return false;
      const tx = s.x - s.vx * (s.len/14);
      const ty = s.y - s.vy * (s.len/14);
      const g = ctx.createLinearGradient(s.x,s.y,tx,ty);
      g.addColorStop(0,`rgba(255,255,255,${s.life*.92})`);
      g.addColorStop(.3,`rgba(197,160,89,${s.life*.5})`);
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(tx,ty);
      ctx.strokeStyle=g; ctx.lineWidth=s.width*(1+s.life*.5); ctx.lineCap='round'; ctx.stroke();
      s.x += s.vx; s.y += s.vy;
      return s.x > -50 && s.y < H+50;
    });
  }

  window.addEventListener('resize', resize, { passive:true });
  resize(); draw();
}
