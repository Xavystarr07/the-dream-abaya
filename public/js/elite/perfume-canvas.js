'use strict';
// ─────────────────────────────────────────────────────────────
// PERFUME CANVAS — inline helpers, no global dependency
// ─────────────────────────────────────────────────────────────
var _r  = _r  || function(mn, mx){ return Math.random() * (mx - mn) + mn; };
var _ir = _ir || function(mn, mx){ return Math.floor(_r(mn, mx + 1)); };

// ─────────────────────────────────────────────────────────────
// SECTION 5 — PERFUME MIST CANVAS
// ─────────────────────────────────────────────────────────────
function initPerfumeCanvas() {
  const canvas = document.getElementById('perfumeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, wisps = [], orbs = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    makeWisps(); makeOrbs();
  }

  const SCENT_COLORS = [
    ['rgba(167,139,250,','rgba(139,92,246,'],
    ['rgba(244,114,182,','rgba(219,39,119,'],
    ['rgba(197,160,89,', 'rgba(161,122,50,'],
    ['rgba(186,230,253,','rgba(125,211,252,'],
    ['rgba(240,171,252,','rgba(192,132,252,'],
  ];

  function makeWisps() {
    wisps = Array.from({ length: 16 }, () => {
      const [c1, c2] = SCENT_COLORS[_ir(0, SCENT_COLORS.length-1)];
      return {
        x: _r(W*.1, W*.9), y: _r(H*.1, H*.9),
        cx: _r(0, W), cy: _r(0, H),
        vx: _r(-.3, .3), vy: _r(-.7, -.1),
        dcx: _r(-.5,.5), dcy: _r(-.4,.4),
        w: _r(12, 40), h: _r(40, 120),
        o: _r(.06, .25), do: _r(.002,.006)*(Math.random()>.5?1:-1),
        c1, c2, rot: _r(0,360), drot: _r(-.3,.3)
      };
    });
  }

  function makeOrbs() {
    orbs = Array.from({ length: 8 }, () => {
      const [c1] = SCENT_COLORS[_ir(0, SCENT_COLORS.length-1)];
      return {
        x: _r(W*.1, W*.9), y: _r(H*.1, H*.9),
        vx: _r(-.2,.2), vy: _r(-.4,-.05),
        r: _r(8, 28),
        o: _r(.08, .3), do: _r(.002,.005)*(Math.random()>.5?1:-1),
        color: c1, pulse: _r(0, Math.PI*2), dpulse: _r(.02,.05)
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    orbs.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      o.o += o.do; if (o.o>.32||o.o<.05) o.do*=-1;
      o.pulse += o.dpulse;
      if (o.y < -30) { o.y = H+20; o.x=_r(W*.1,W*.9); }
      const r = o.r * (1 + Math.sin(o.pulse)*0.18);
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r*3.5);
      g.addColorStop(0,   o.color + (o.o*1.8).toFixed(2)+')');
      g.addColorStop(0.4, o.color + o.o.toFixed(2)+')');
      g.addColorStop(1,   o.color + '0)');
      ctx.beginPath(); ctx.arc(o.x, o.y, r*3.5, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(o.x, o.y, r*.35, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,' + (o.o*1.5).toFixed(2)+')'; ctx.fill();
    });

    wisps.forEach(w => {
      w.x += w.vx; w.y += w.vy;
      w.cx += w.dcx; w.cy += w.dcy;
      w.rot += w.drot;
      w.o += w.do; if (w.o>.28||w.o<.04) w.do*=-1;
      if (w.y < -w.h) { w.y = H+20; w.x=_r(W*.1,W*.9); }
      if (w.cx<0||w.cx>W) w.dcx*=-1;
      ctx.save(); ctx.translate(w.x, w.y); ctx.rotate(w.rot*Math.PI/180);
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

// ─────────────────────────────────────────────────────────────
// SECTION 6 — FLOATING PERFUME BOTTLES CANVAS
// ─────────────────────────────────────────────────────────────
function initPerfumesFloatCanvas() {
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
      x: _r(0, W), y: _r(0, H),
      vx: _r(-.5, .5), vy: _r(-.8, -.15),
      r: _r(.8, 3.5),
      o: _r(.2, .75), do: _r(.005,.015)*(Math.random()>.5?1:-1),
      color: Math.random()>.45
        ? 'rgba(197,160,89,'
        : Math.random()>.5 ? 'rgba(255,230,120,' : 'rgba(255,255,210,'
    }));
  }

  function makeTrails() {
    trails = Array.from({ length: 5 }, () => ({
      x: _r(W*.1, W*.9), y: _r(H*.1, H*.85),
      angle: _r(0, Math.PI*2),
      speed: _r(.8, 2.2),
      length: _r(40, 90),
      history: [],
      o: _r(.3, .6), do: _r(.003,.008)*(Math.random()>.5?1:-1),
      timer: 0
    }));
  }

  function spawnBurst(x, y) {
    const count = _ir(6, 12);
    for (let i = 0; i < count; i++) {
      const angle = (i/count)*Math.PI*2 + _r(0,.5);
      const speed = _r(1, 3.5);
      sparkBursts.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        r: _r(1, 3), life: 1,
        decay: _r(.025,.06),
        color: Math.random()>.5 ? 'rgba(255,220,100,' : 'rgba(197,160,89,'
      });
    }
  }

  let burstTimer = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    burstTimer++;
    if (burstTimer > 90) {
      burstTimer = 0;
      spawnBurst(_r(W*.15, W*.85), _r(H*.15, H*.85));
    }

    dustParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.o += p.do; if (p.o>.78||p.o<.1) p.do*=-1;
      if (p.y < -10) { p.y = H+5; p.x = _r(0,W); }
      if (p.x < -5 || p.x > W+5) p.x = _r(0,W);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*2.5);
      g.addColorStop(0, p.color + p.o.toFixed(2)+')');
      g.addColorStop(1, p.color + '0)');
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r*2.5, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    });

    trails.forEach(t => {
      t.angle += _r(-.04,.04);
      t.x += Math.cos(t.angle)*t.speed;
      t.y += Math.sin(t.angle)*t.speed;
      t.o += t.do; if (t.o>.65||t.o<.15) t.do*=-1;
      t.history.push({x:t.x, y:t.y});
      if (t.history.length > t.length) t.history.shift();
      if (t.x<0||t.x>W||t.y<0||t.y>H) {
        t.x=_r(W*.2,W*.8); t.y=_r(H*.2,H*.8);
        t.angle=_r(0,Math.PI*2); t.history=[];
      }
      if (t.history.length > 2) {
        ctx.beginPath(); ctx.moveTo(t.history[0].x, t.history[0].y);
        for (let i=1; i<t.history.length; i++) ctx.lineTo(t.history[i].x, t.history[i].y);
        const frac = t.history.length / t.length;
        ctx.strokeStyle = 'rgba(197,160,89,' + (t.o * frac * .55).toFixed(3) + ')';
        ctx.lineWidth = 1.2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
      }
    });

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
