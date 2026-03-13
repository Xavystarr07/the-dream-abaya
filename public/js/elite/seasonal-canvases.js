/* ============================================================
   THE DREAM ABAYA — seasonal-canvases.js
   Contains: initSeasonalCanvases, initSummerCanvas,
   initAutumnCanvas, initWinterCanvas, initSpringCanvas,
   startSeasonImmersiveCanvas, stopSeasonImmersiveCanvas
   ============================================================ */
'use strict';

// ── Called by elite-init.js ───────────────────────────────────
function initSeasonalCanvases() {
  initSummerCanvas();
  initAutumnCanvas();
  initWinterCanvas();
  initSpringCanvas();
}

// ── SUMMER ────────────────────────────────────────────────────
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
  const sparks = Array.from({length:12}, () => ({
    x: cx + (Math.random()-.5)*30, y: cy + (Math.random()-.5)*30,
    vx: (Math.random()-.5)*.8, vy: -(.5 + Math.random()*.8),
    r: .8+Math.random()*2, o: .3+Math.random()*.4, life:1
  }));
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.022;
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * .56);
    bg.addColorStop(0, 'rgba(255,200,30,0.18)');
    bg.addColorStop(.5, 'rgba(255,140,0,0.07)');
    bg.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const corona = ctx.createRadialGradient(cx, cy, 14, cx, cy, 52);
    corona.addColorStop(0,   'rgba(255,220,60,0.35)');
    corona.addColorStop(0.6, 'rgba(255,170,0,0.12)');
    corona.addColorStop(1,   'rgba(255,120,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI*2);
    ctx.fillStyle = corona; ctx.fill();
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
    const sunG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    sunG.addColorStop(0,   'rgba(255,255,180,1)');
    sunG.addColorStop(0.3, 'rgba(255,230,40,0.95)');
    sunG.addColorStop(0.7, 'rgba(255,180,0,0.85)');
    sunG.addColorStop(1,   'rgba(245,120,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2);
    ctx.fillStyle = sunG; ctx.fill();
    ctx.beginPath(); ctx.arc(cx-4, cy-4, 6, 0, Math.PI*2);
    ctx.fillStyle='rgba(255,255,230,0.7)'; ctx.fill();
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

// ── AUTUMN ────────────────────────────────────────────────────
function initAutumnCanvas() {
  const c = document.getElementById('autumnCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const LEAF_COLORS = ['#D97706','#B45309','#EA580C','#DC2626','#92400E','#F59E0B'];
  const leaves = Array.from({length: 16}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-0.5)*0.7, vy: 0.4+Math.random()*0.9,
    rot: Math.random()*360, drot: (Math.random()-0.5)*3,
    w: 7+Math.random()*10, h: 5+Math.random()*8,
    color: LEAF_COLORS[Math.floor(Math.random()*LEAF_COLORS.length)],
    sway: Math.random()*Math.PI*2, swaySpeed: 0.02+Math.random()*0.02
  }));
  function drawLeaf(ctx, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(-w*0.6, h*0.4, -w*0.8, -h*0.1, 0, -h);
    ctx.bezierCurveTo(w*0.8, -h*0.1, w*0.6, h*0.4, 0, h);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(120,60,20,0.6)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(0,h+4); ctx.stroke();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    leaves.forEach(l => {
      l.sway += l.swaySpeed;
      l.x += l.vx + Math.sin(l.sway)*0.4;
      l.y += l.vy; l.rot += l.drot;
      if (l.y > H+20) { l.y=-15; l.x=Math.random()*W; }
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot*Math.PI/180);
      ctx.globalAlpha=0.82; drawLeaf(ctx, l.w, l.h, l.color);
      ctx.restore(); ctx.globalAlpha=1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── WINTER ────────────────────────────────────────────────────
function initWinterCanvas() {
  const c = document.getElementById('winterCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const flakes = Array.from({length: 28}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vy: 0.25+Math.random()*0.7, vx: (Math.random()-0.5)*0.3,
    r: 2+Math.random()*5, o: 0.3+Math.random()*0.5,
    rot: 0, rotSpeed: (Math.random()-0.5)*0.8
  }));
  function drawSnowflake(ctx, r, o) {
    ctx.globalAlpha = o;
    ctx.strokeStyle = 'rgba(186,230,253,0.95)';
    for (let i=0; i<6; i++) {
      ctx.lineWidth = r>4 ? 1.2 : 0.8;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-r*2.6); ctx.stroke();
      const bLen=r*0.9, bPos=r*1.5;
      ctx.lineWidth = r>4 ? 0.8 : 0.5;
      ctx.beginPath(); ctx.moveTo(0,-bPos); ctx.lineTo(-bLen*0.7,-bPos-bLen*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-bPos); ctx.lineTo(bLen*0.7,-bPos-bLen*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(-bLen*0.4,-r-bLen*0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(bLen*0.4,-r-bLen*0.35); ctx.stroke();
      ctx.rotate(Math.PI/3);
    }
    ctx.beginPath(); ctx.arc(0,0,r*0.25,0,Math.PI*2);
    ctx.fillStyle='rgba(219,234,254,0.8)'; ctx.fill();
    ctx.globalAlpha=1;
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => {
      f.x+=f.vx; f.y+=f.vy; f.rot+=f.rotSpeed;
      if (f.y>H+10) { f.y=-8; f.x=Math.random()*W; }
      ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(f.rot*Math.PI/180);
      drawSnowflake(ctx, f.r, f.o); ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── SPRING ────────────────────────────────────────────────────
function initSpringCanvas() {
  const c = document.getElementById('springCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const PETAL_COLORS = ['#F472B6','#E879F9','#FDA4AF','#C084FC','#FCA5A5','#FBCFE8'];
  const petals = Array.from({length: 20}, () => ({
    x: Math.random()*W, y: H*0.3+Math.random()*H*0.7,
    vx: (Math.random()-0.5)*0.6, vy: -(0.4+Math.random()*0.7),
    rot: Math.random()*360, drot: (Math.random()-0.5)*2.5,
    w: 6+Math.random()*8, h: 4+Math.random()*6,
    color: PETAL_COLORS[Math.floor(Math.random()*PETAL_COLORS.length)],
    sway: Math.random()*Math.PI*2
  }));
  function drawPetal(ctx, w, h, color) {
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.ellipse(0,0,w*0.45,h,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(-w*0.1,-h*0.2,w*0.15,h*0.45,-0.3,0,Math.PI*2); ctx.fill();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.sway+=0.025; p.x+=p.vx+Math.sin(p.sway)*0.35;
      p.y+=p.vy; p.rot+=p.drot;
      if (p.y<-20) { p.y=H+10; p.x=Math.random()*W; }
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.globalAlpha=0.78; drawPetal(ctx,p.w,p.h,p.color);
      ctx.restore(); ctx.globalAlpha=1;
    });
    const cx=W/2, cy=H/2;
    ctx.strokeStyle='rgba(101,60,50,0.3)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-20,cy+15); ctx.quadraticCurveTo(cx,cy-5,cx+20,cy+10); ctx.stroke();
    requestAnimationFrame(draw);
  }
  draw();
}

// ── IMMERSIVE SEASON OVERLAY ──────────────────────────────────
let seasonImmersiveAnimId = null;
let seasonImmersiveParticles = [];

function startSeasonImmersiveCanvas(season) {
  const canvas = document.getElementById('seasonImmersiveCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('section-seasonal');
  const W = canvas.width  = section ? section.offsetWidth  : window.innerWidth;
  const H = canvas.height = section ? section.offsetHeight : window.innerHeight;

  seasonImmersiveParticles = [];
  if (seasonImmersiveAnimId) cancelAnimationFrame(seasonImmersiveAnimId);

  // Spawn particles
  if (season === 'summer') {
    for (let i=0;i<90;i++) {
      const warm=Math.random();
      seasonImmersiveParticles.push({
        type:'spark', x:rand(0,W), y:rand(H*.3,H*1.2),
        vx:rand(-1,1), vy:rand(-3.5,-1.2), r:rand(1.5,5),
        o:rand(.4,.9), life:rand(.5,1),
        color:warm>.6?'rgba(255,230,40,':warm>.3?'rgba(255,180,0,':'rgba(255,255,180,',
        decay:rand(.006,.016)
      });
    }
  } else if (season === 'autumn') {
    const colors=['rgba(217,119,6,','rgba(180,83,9,','rgba(234,88,12,','rgba(220,38,38,','rgba(245,158,11,'];
    for (let i=0;i<70;i++) {
      seasonImmersiveParticles.push({
        x:rand(-50,W+50), y:rand(-H,0),
        vx:rand(-1,1.5), vy:rand(1.5,4),
        rot:rand(0,360), drot:rand(-3,3),
        w:rand(10,22), h:rand(7,16),
        o:rand(.5,.9), life:1, decay:0,
        color:colors[irand(0,colors.length-1)]
      });
    }
  } else if (season === 'winter') {
    for (let i=0;i<80;i++) {
      seasonImmersiveParticles.push({
        x:rand(0,W), y:rand(-H,0),
        vx:rand(-.5,.5), vy:rand(.5,2),
        rot:0, drot:rand(-.5,.5),
        r:rand(3,10), o:rand(.4,.9), life:1, decay:0,
        color:'rgba(186,230,253,'
      });
    }
  } else if (season === 'spring') {
    const pcols=['rgba(244,114,182,','rgba(192,132,252,','rgba(253,164,175,','rgba(240,171,252,'];
    for (let i=0;i<70;i++) {
      seasonImmersiveParticles.push({
        x:rand(-30,W+30), y:rand(-H*.5,0),
        vx:rand(-.8,1.2), vy:rand(.6,2.5),
        rot:rand(0,360), drot:rand(-2,2),
        w:rand(6,16), h:rand(4,11),
        o:rand(.5,.9), life:1, decay:0,
        color:pcols[irand(0,pcols.length-1)]
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0,0,W,H);
    seasonImmersiveParticles.forEach(p => {
      if (p.type === 'spark') {
        p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
        if (p.life<=0||p.y<-20) {
          p.x=rand(0,W); p.y=H+10; p.life=rand(.5,1);
          p.vy=rand(-3.5,-1.2); p.vx=rand(-1,1);
        }
        ctx.globalAlpha=p.life*p.o;
        ctx.fillStyle=p.color+'1)';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1;
      } else {
        // leaf / snowflake / petal
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.drot||0;
        if (season==='winter'||season==='spring') {
          if (p.y>H+20) { p.y=-20; p.x=rand(0,W); }
        } else {
          if (p.y>H+30) { p.y=rand(-H,0); p.x=rand(-50,W+50); }
        }
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate((p.rot||0)*Math.PI/180);
        ctx.globalAlpha=p.o||0.7;
        if (season==='winter') {
          ctx.strokeStyle=p.color+'0.9)';
          for (let i=0;i<6;i++) {
            ctx.lineWidth=p.r>6?1.2:0.8;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-p.r*2.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,-p.r*1.5); ctx.lineTo(-p.r*.7,-p.r*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,-p.r*1.5); ctx.lineTo(p.r*.7,-p.r*2); ctx.stroke();
            ctx.rotate(Math.PI/3);
          }
        } else {
          ctx.fillStyle=p.color+'1)';
          ctx.beginPath(); ctx.ellipse(0,0,(p.w||8)*.4,(p.h||10),0,0,Math.PI*2); ctx.fill();
        }
        ctx.restore(); ctx.globalAlpha=1;
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