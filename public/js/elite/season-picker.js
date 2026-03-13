'use strict';
// ─────────────────────────────────────────────────────────────
// SEASONAL SELECTION
// ─────────────────────────────────────────────────────────────
const SEASON_DATA = {
  summer: {
    icon: '☀️',
    title: 'Summer Collection',
    poem: 'Light breathes through linen,\nsun-kissed and free —\na modest glow in the golden heat.',
    bg: 'linear-gradient(135deg, #1A1000 0%, #2D1800 40%, #1A0E00 100%)',
    accent: '#FCD34D',
    categories: ['aesthetic', 'accessories']
  },
  autumn: {
    icon: '🍂',
    title: 'Autumn Collection',
    poem: 'Copper leaves and amber light,\nwarm layers wrapped with grace —\nthe season of rich, quiet beauty.',
    bg: 'linear-gradient(135deg, #1A0800 0%, #2D1200 40%, #180A00 100%)',
    accent: '#F97316',
    categories: ['modest', 'accessories']
  },
  winter: {
    icon: '❄️',
    title: 'Winter Collection',
    poem: 'Velvet silence, crystal cold,\nroyal depths and midnight hues —\nwear the season\'s quiet power.',
    bg: 'linear-gradient(135deg, #020815 0%, #061230 40%, #040A20 100%)',
    accent: '#93C5FD',
    categories: ['dream', 'hijabs']
  },
  spring: {
    icon: '🌸',
    title: 'Spring Collection',
    poem: 'Petals unfold in soft morning light,\npastel and petal, bloom and grace —\nspringtime dressed in modesty.',
    bg: 'linear-gradient(135deg, #100520 0%, #1A0A35 40%, #0E0520 100%)',
    accent: '#F0ABFC',
    categories: ['modest', 'aesthetic', 'perfumes']
  }
};

function selectSeason(season) {
  const data    = SEASON_DATA[season];
  const chooser = document.getElementById('seasonChooser');
  const display = document.getElementById('seasonDisplay');
  const section = document.getElementById('section-seasonal');
  if (!data || !chooser || !display) return;

  // Update display content
  document.getElementById('sdIcon').textContent  = data.icon;
  document.getElementById('sdTitle').textContent = data.title;
  document.getElementById('sdPoem').innerHTML    = data.poem.replace(/\n/g, '<br/>');
  document.getElementById('seasonViewAll').href  = `/vault?category=${data.categories[0]}`;

  // Change section background
  if (section) section.style.background = data.bg;

  // Load season products from page products (filter by category)
  const container = document.getElementById('seasonProducts');
  if (container) {
    // Clone product cards that match the season's categories
    const allCards = Array.from(document.querySelectorAll('.product-card'));
    container.innerHTML = '';
    const matching = [];
    allCards.forEach(card => {
      const catEl = card.querySelector('.product-card-cat');
      if (!catEl) return;
      const catText = catEl.textContent.toLowerCase();
      const matches = data.categories.some(cat =>
        catText.includes(cat) || card.closest(`#section-${cat}`) !== null
      );
      if (matches && matching.length < 4) {
        matching.push(card.cloneNode(true));
      }
    });
    if (matching.length === 0) {
      // Fallback: grab any 4 cards
      allCards.slice(0, 4).forEach(c => container.appendChild(c.cloneNode(true)));
    } else {
      matching.forEach(c => container.appendChild(c));
    }
  }

  // Animate transition
  if (typeof gsap !== 'undefined') {
    gsap.to(chooser, { opacity:0, y:-30, duration:.4, ease:'power2.in', onComplete: () => {
      chooser.style.display = 'none';
      display.style.display = 'block';
      gsap.fromTo(display, { opacity:0, y:30 }, { opacity:1, y:0, duration:.6, ease:'power3.out' });
    }});
  } else {
    chooser.style.display = 'none';
    display.style.display = 'block';
  }


} 

function closeSeason() {
  const chooser = document.getElementById('seasonChooser');
  const display = document.getElementById('seasonDisplay');
  const section = document.getElementById('section-seasonal');
  if (!chooser || !display) return;
  if (section) section.style.background = '';


  if (typeof gsap !== 'undefined') {
    gsap.to(display, { opacity:0, y:20, duration:.35, ease:'power2.in', onComplete: () => {
      display.style.display = 'none';
      chooser.style.display = 'flex';
      gsap.fromTo(chooser, { opacity:0 }, { opacity:1, duration:.5, ease:'power2.out' });
    }});
  } else {
    display.style.display = 'none';
    chooser.style.display = 'flex';
  }
}
