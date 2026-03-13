/* THE DREAM ABAYA — reveal.js
   Mist reveal overlay. Fires 'eliteRevealDone' when done. */
'use strict';

function initReveal() {
  const overlay = document.getElementById('reveal-overlay');
  if (!overlay || typeof gsap === 'undefined') {
    document.dispatchEvent(new Event('eliteRevealDone'));
    return;
  }

  document.body.style.overflow = 'hidden';

  const mistCanvas = document.getElementById('mistCanvas');
  if (mistCanvas) {
    const ctx = mistCanvas.getContext('2d');
    let W, H, motes = [], rafId;

    function resizeMist() {
      W = mistCanvas.width  = mistCanvas.offsetWidth  || window.innerWidth;
      H = mistCanvas.height = mistCanvas.offsetHeight || window.innerHeight;
    }

    const PALETTES = [
      [197,160,89],[220,190,110],[140,80,200],[100,60,180],[255,240,200]
    ];

    function makeMote() {
      const [r,g,b] = PALETTES[Math.floor(Math.random()*PALETTES.length)];
      return {
        x: Math.random()*W, y: Math.random()*H,
        r: 0.5+Math.random()*2.5, o: 0.0,
        maxO: 0.08+Math.random()*0.25, do: 0.004+Math.random()*0.008,
        vx: (Math.random()-0.5)*0.4, vy: -0.2-Math.random()*0.5,
        col: `${r},${g},${b}`,
        phase: Math.random()>.5 ? 'in' : 'hold'
      };
    }

    function animMist() {
      if (!motes.length) for (let i=0;i<120;i++) motes.push(makeMote());
      ctx.clearRect(0,0,W,H);
      motes.forEach(m => {
        if (m.phase==='in')  { m.o+=m.do; if(m.o>=m.maxO){m.o=m.maxO;m.phase='hold';} }
        if (m.phase==='hold'){ m.o+=Math.sin(Date.now()*.001)*0.002; }
        m.x+=m.vx; m.y+=m.vy;
        if (m.y<-5) { m.y=H+5; m.x=Math.random()*W; }
        const g2=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*4);
        g2.addColorStop(0,`rgba(${m.col},${m.o.toFixed(3)})`);
        g2.addColorStop(1,`rgba(${m.col},0)`);
        ctx.beginPath(); ctx.arc(m.x,m.y,m.r*4,0,Math.PI*2);
        ctx.fillStyle=g2; ctx.fill();
      });
      rafId=requestAnimationFrame(animMist);
    }

    resizeMist(); animMist();
    window.addEventListener('resize',resizeMist,{passive:true});
  }

  // Logo + tagline animate in
  const logoEl    = overlay.querySelector('.reveal-logo');
  const taglineEl = overlay.querySelector('.reveal-tagline');
  const tl        = gsap.timeline();

  if (logoEl)    tl.fromTo(logoEl,    {opacity:0,y:30},{opacity:1,y:0,duration:1.2,ease:'power3.out'});
  if (taglineEl) tl.fromTo(taglineEl, {opacity:0,y:20},{opacity:1,y:0,duration:.9, ease:'power3.out'},'-=.4');

  // Dissolve overlay out after 3.2s
  tl.to(overlay, {
    opacity:0, duration:1.0, ease:'power2.inOut', delay:1.8,
    onComplete: () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      document.dispatchEvent(new Event('eliteRevealDone'));
    }
  });
}