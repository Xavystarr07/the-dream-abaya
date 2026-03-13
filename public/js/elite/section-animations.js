'use strict';

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
