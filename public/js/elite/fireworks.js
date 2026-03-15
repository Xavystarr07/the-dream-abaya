'use strict';
var _r  = _r  || function(mn,mx){ return Math.random()*(mx-mn)+mn; };
var _ir = _ir || function(mn,mx){ return Math.floor(_r(mn,mx+1)); };

function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, rafId = null;
  let rockets = [], bursts = [], glitters = [];
  let paused = false;

  let stars = [];

  let shooters = [];

  function makeStars() {
    stars = [];

    // Layer 1 — distant faint (few, not many)
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: _r(0,W), y: _r(0,H),
        r: _r(.15,.45),
        o: _r(.06,.28), do: _r(.003,.008) * (Math.random()>.5?1:-1),
        hue: 'rgba(200,210,255,',
        twinkle: false, spike: false,
      });
    }

    // Layer 2 — mid warm/cool stars
    for (let i = 0; i < 70; i++) {
      const warm = Math.random() > .6;
      stars.push({
        x: _r(0,W), y: _r(0,H*.9),
        r: _r(.4,1.0),
        o: _r(.2,.55), do: _r(.004,.013) * (Math.random()>.5?1:-1),
        hue: warm ? 'rgba(255,230,180,' : 'rgba(220,230,255,',
        twinkle: Math.random() > .55,
        phase: _r(0,Math.PI*2), speed: _r(.02,.06),
        spike: false,
      });
    }

    // Layer 3 — bright with glow + diffraction spikes (only 12)
    for (let i = 0; i < 12; i++) {
      const col = ['rgba(255,245,210,','rgba(180,210,255,','rgba(255,200,160,'][_ir(0,2)];
      stars.push({
        x: _r(0,W), y: _r(0,H*.85),
        r: _r(1.2,2.2),
        o: _r(.55,.9), do: _r(.006,.016) * (Math.random()>.5?1:-1),
        hue: col,
        twinkle: true, phase: _r(0,Math.PI*2), speed: _r(.03,.07),
        spike: true,
      });
    }

    // Milky Way purple cluster (subtle)
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: _r(W*.2,W*.8), y: _r(0,H*.55),
        r: _r(.2,.6),
        o: _r(.04,.16), do: _r(.002,.006) * (Math.random()>.5?1:-1),
        hue: 'rgba(180,150,255,',
        twinkle: false, spike: false,
      });
    }
  }

  function scheduleShooter() {
    if (!paused) {
      const angle = _r(.18,.42), spd = _r(7,13);
      shooters.push({
        x: _r(W*.05,W*.85), y: _r(0,H*.4),
        vx: -Math.cos(angle)*spd, vy: Math.sin(angle)*spd,
        len: _r(100,240), life: 1,
        decay: _r(.02,.038), width: _r(.6,1.3),
      });
    }
    setTimeout(scheduleShooter, _r(5000,11000));
  }
  setTimeout(scheduleShooter, _r(2000,5000));

  function drawStars() {
    // Shooting stars
    shooters = shooters.filter(s => {
      s.life -= s.decay; if (s.life <= 0) return false;
      const tx = s.x - s.vx*(s.len/14), ty = s.y - s.vy*(s.len/14);
      const g = ctx.createLinearGradient(s.x,s.y,tx,ty);
      g.addColorStop(0,`rgba(255,255,255,${s.life*.9})`);
      g.addColorStop(.35,`rgba(197,160,89,${s.life*.5})`);
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(tx,ty);
      ctx.strokeStyle=g; ctx.lineWidth=s.width*(1+s.life*.4);
      ctx.lineCap='round'; ctx.stroke();
      s.x+=s.vx; s.y+=s.vy;
      return s.x>-50 && s.y<H+50;
    });

    // Stars
    stars.forEach(s => {
      let o = s.o;
      if (s.twinkle) {
        s.phase += s.speed;
        o = Math.max(.02, Math.min(1, s.o + Math.sin(s.phase)*s.o*.5));
      } else {
        s.o += s.do; if (s.o>.95||s.o<.01) s.do*=-1; o = s.o;
      }
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = s.hue+o+')'; ctx.fill();

      // Soft atmospheric glow — large diffuse halo
      if (s.r > .9 && o > .3) {
        const g = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
        g.addColorStop(0,   s.hue+(o*.35)+')');
        g.addColorStop(0.3, s.hue+(o*.12)+')');
        g.addColorStop(1,   s.hue+'0)');
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*5,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
      }

      // Airy disc diffraction — 4 soft lens flare streaks, NOT hard lines
      if (s.spike && o > .4) {
        const len = s.r * 7 * o;
        const w   = s.r * 0.9;          // streak width — soft, not 1px
        ctx.save();
        // Horizontal streak
        const gH = ctx.createLinearGradient(s.x-len,s.y, s.x+len,s.y);
        gH.addColorStop(0,   s.hue+'0)');
        gH.addColorStop(0.4, s.hue+(o*.22)+')');
        gH.addColorStop(0.5, s.hue+(o*.55)+')');
        gH.addColorStop(0.6, s.hue+(o*.22)+')');
        gH.addColorStop(1,   s.hue+'0)');
        ctx.fillStyle = gH;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, len, w, 0, 0, Math.PI*2);
        ctx.fill();
        // Vertical streak
        const gV = ctx.createLinearGradient(s.x,s.y-len, s.x,s.y+len);
        gV.addColorStop(0,   s.hue+'0)');
        gV.addColorStop(0.4, s.hue+(o*.18)+')');
        gV.addColorStop(0.5, s.hue+(o*.45)+')');
        gV.addColorStop(0.6, s.hue+(o*.18)+')');
        gV.addColorStop(1,   s.hue+'0)');
        ctx.fillStyle = gV;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, w, len, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || canvas.width  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || canvas.height || window.innerHeight;
    makeStars();
  }

  // ── Realistic palette ───────────────────────────────────────
  const PALETTES = [
    ['#FFD700','#FFF8C0','#FFB800'],   // gold
    ['#FFFFFF','#E8E8FF','#C0D0FF'],   // silver
    ['#FF9ECD','#FFB3D9','#FFFFFF'],   // rose
    ['#B8A0FF','#D4C0FF','#FFFFFF'],   // lavender
    ['#A0D8FF','#C0ECFF','#FFFFFF'],   // icy blue
    ['#C5A059','#E8D5A3','#FFFFFF'],   // brand gold
  ];
  function randomPalette() { return PALETTES[_ir(0, PALETTES.length-1)]; }

  // ── ROCKET ──────────────────────────────────────────────────
  function launchRocket() {
    if (paused) return;
    const palette = randomPalette();
    rockets.push({
      x:     _r(W * .18, W * .82),
      y:     H + 4,
      destY: _r(H * .10, H * .42),
      vx:    _r(-.6, .6),
      speed: _r(6, 10),
      trail: [],
      palette,
      wobble: _r(-.008, .008),
    });
  }

  // ── EXPLOSION ───────────────────────────────────────────────
  function explode(x, y, palette) {
    const type  = _ir(0, 2);  // 0=sphere 1=ring 2=chrysanthemum
    const count = type === 2 ? _ir(90,130) : _ir(60,90);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + _r(-.05, .05);
      const spd   = type === 1 ? _r(4.5,5.5) : _r(1.8, type===2 ? 9 : 6);
      bursts.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1, decay: _r(.010, .020),
        r: _r(1.2, 2.8),
        color: palette[_ir(0, palette.length-1)],
        gravity: _r(.045, .07), friction: _r(.970, .985),
        tail: [],
      });
    }

    // Glitter embers
    for (let i = 0; i < _ir(18,32); i++) {
      const angle = _r(0, Math.PI*2), spd = _r(2,5);
      glitters.push({
        x, y,
        vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - _r(1,3),
        life: 1, decay: _r(.014,.026),
        r: _r(.6,1.6), color: palette[0],
        gravity: .09, twinkle: Math.random() > .5,
      });
    }

    // Central flash
    glitters.push({ x, y, vx:0, vy:0, life:1, decay:.08, r:_r(6,14), color:'#FFFFFF', gravity:0, flash:true });
  }

  // ── LAUNCH SCHEDULE — spaced, not spammy ───────────────────
  [800, 2800, 5200].forEach(t => setTimeout(launchRocket, t));

  function scheduleLaunches() {
    if (!paused) {
      launchRocket();
      if (Math.random() > .45) setTimeout(launchRocket, _r(900,1800));
    }
    setTimeout(scheduleLaunches, _r(4500, 8000));
  }
  setTimeout(scheduleLaunches, 7000);

  // ── PAUSE/RESUME — tab visibility ──────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      rockets = []; bursts = []; glitters = [];   // clear backlog
    } else {
      paused = false;
      if (!rafId) draw();
    }
  });

  // ── PAUSE/RESUME — slider slide change ─────────────────────
  document.addEventListener('heroSlideChange', e => {
    if (e.detail.isFireworks) {
      paused = false;
      if (!rafId) draw();
    } else {
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      rockets = []; bursts = []; glitters = [];
    }
  });

  // ── DRAW ────────────────────────────────────────────────────
  function draw() {
    if (paused) { rafId = null; return; }
    rafId = requestAnimationFrame(draw);

    // Soft fade trail (dark purple bg)
  ctx.fillStyle = 'rgba(10, 5, 20, .22)';      // this controls the main page first slider css entirely
    ctx.fillRect(0, 0, W, H);

    // Stars drawn first — rockets + bursts appear on top
    drawStars();

    // Rockets
    rockets = rockets.filter(r => {
      r.x += r.vx; r.y -= r.speed; r.vx += r.wobble;
      r.trail.push({ x:r.x, y:r.y });
      if (r.trail.length > 16) r.trail.shift();
      r.trail.forEach((pt,i) => {
        const a = (i/r.trail.length)*.55, sz = (i/r.trail.length)*2.2;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, sz, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,210,80,${a})`; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.2, 0, Math.PI*2);
      ctx.fillStyle = '#FFF8C0';
      ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 12;
      ctx.fill(); ctx.shadowBlur = 0;
      if (r.y <= r.destY) { explode(r.x, r.y, r.palette); return false; }
      return true;
    });

    // Bursts
    bursts = bursts.filter(b => {
      b.life -= b.decay; if (b.life <= 0) return false;
      b.vx *= b.friction; b.vy *= b.friction; b.vy += b.gravity;
      b.tail.push({ x:b.x, y:b.y }); if (b.tail.length > 4) b.tail.shift();
      b.x += b.vx; b.y += b.vy;
      b.tail.forEach((pt,i) => {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, b.r*.4, 0, Math.PI*2);
        ctx.fillStyle = b.color; ctx.globalAlpha = (i/b.tail.length)*b.life*.45;
        ctx.fill(); ctx.globalAlpha = 1;
      });
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r*b.life, 0, Math.PI*2);
      ctx.fillStyle = b.color; ctx.globalAlpha = b.life*.85;
      ctx.shadowColor = b.color; ctx.shadowBlur = 4;
      ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      return true;
    });

    // Glitters
    glitters = glitters.filter(g => {
      g.life -= g.decay; if (g.life <= 0) return false;
      if (!g.flash) { g.vx *= .96; g.vy *= .96; g.vy += g.gravity; }
      g.x += g.vx; g.y += g.vy;
      if (g.flash) {
        const grad = ctx.createRadialGradient(g.x,g.y,0,g.x,g.y,g.r*(2-g.life));
        grad.addColorStop(0,`rgba(255,255,255,${g.life*.9})`);
        grad.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(g.x,g.y,g.r*(2-g.life),0,Math.PI*2);
        ctx.fillStyle=grad; ctx.fill();
      } else if (g.twinkle && g.life>.4) {
        const s = g.r*g.life*3;
        ctx.strokeStyle=g.color; ctx.globalAlpha=g.life*.7; ctx.lineWidth=.8;
        ctx.beginPath(); ctx.moveTo(g.x-s,g.y); ctx.lineTo(g.x+s,g.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(g.x,g.y-s); ctx.lineTo(g.x,g.y+s); ctx.stroke();
        ctx.globalAlpha=1;
      } else {
        ctx.beginPath(); ctx.arc(g.x,g.y,g.r*g.life,0,Math.PI*2);
        ctx.fillStyle=g.color; ctx.globalAlpha=g.life*.75;
        ctx.fill(); ctx.globalAlpha=1;
      }
      return true;
    });
  }

  window.addEventListener('resize', resize, { passive:true });
  resize(); draw();
}
