'use strict';
// ── Aliases — safe whether utils.js globals landed or not ────
var rand  = rand  || function(mn,mx){ return Math.random()*(mx-mn)+mn; };
var irand = irand || function(mn,mx){ return Math.floor(rand(mn,mx+1)); };
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
