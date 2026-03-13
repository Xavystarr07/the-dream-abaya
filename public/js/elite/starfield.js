/* THE DREAM ABAYA — starfield.js */
'use strict';

// ── Inline helpers — no dependency on global rand/irand ──────
function _r(mn, mx)  { return Math.random() * (mx - mn) + mn; }
function _ir(mn, mx) { return Math.floor(_r(mn, mx + 1)); }

function initStarField() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars=[], shooters=[];

  function resize() {
    W=canvas.width=canvas.offsetWidth||window.innerWidth;
    H=canvas.height=canvas.offsetHeight||window.innerHeight;
    makeStars();
  }

  function makeStars() {
    stars=[];
    for(let i=0;i<280;i++){
      const layer=Math.random();
      stars.push({
        x:_r(0,W), y:_r(0,H*.85),
        r:layer>.92?_r(1.5,2.8):layer>.7?_r(.8,1.5):_r(.2,.8),
        o:_r(.05,layer>.85?.9:.5),
        do:_r(.005,.025)*(Math.random()>.5?1:-1),
        hue:Math.random()>.8?`rgba(${_ir(200,255)},${_ir(180,240)},${_ir(220,255)},`:'rgba(255,255,255,'
      });
    }
    for(let i=0;i<60;i++){
      stars.push({x:_r(0,W),y:_r(0,H*.7),r:_r(.3,1.2),o:_r(.05,.35),do:_r(.003,.015)*(Math.random()>.5?1:-1),hue:'rgba(160,120,255,'});
    }
  }

  function launchShooter(){
    shooters.push({x:_r(W*.1,W*.9),y:_r(0,H*.3),vx:_r(-6,-2),vy:_r(1.5,4),len:_r(80,200),life:1,decay:_r(.02,.04)});
  }
  setInterval(()=>launchShooter(), _r(4000,9000));

  function draw(){
    ctx.clearRect(0,0,W,H);
    stars.forEach(s=>{
      s.o+=s.do; if(s.o>.95||s.o<.02)s.do*=-1;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=s.hue+s.o+')'; ctx.fill();
      if(s.r>1.5&&s.o>.5){
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*2.5,0,Math.PI*2);
        const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*2.5);
        g.addColorStop(0,'rgba(255,255,230,'+(s.o*.3)+')');
        g.addColorStop(1,'rgba(255,255,230,0)');
        ctx.fillStyle=g; ctx.fill();
      }
    });
    shooters=shooters.filter(s=>{
      s.life-=s.decay;
      if(s.life<=0)return false;
      const x2=s.x-s.vx*12, y2=s.y-s.vy*12;
      const g=ctx.createLinearGradient(s.x,s.y,x2,y2);
      g.addColorStop(0,'rgba(255,255,255,'+s.life*.9+')');
      g.addColorStop(.5,'rgba(197,160,89,'+s.life*.5+')');
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(x2,y2);
      ctx.strokeStyle=g; ctx.lineWidth=s.life*1.8; ctx.stroke();
      s.x+=s.vx; s.y+=s.vy;
      return true;
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize,{passive:true});
  resize(); draw();
}
