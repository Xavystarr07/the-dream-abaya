// ── SEARCH SUGGESTIONS ────────────────────────────────────────
function initSearchSuggestions() {
  const input  = document.querySelector('.filter-search');
  const sugBox = document.getElementById('searchSuggestions');
  if (!input || !sugBox) return;
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (q.length < 2) { sugBox.classList.remove('open'); return; }
    debounce = setTimeout(() => fetchSuggestions(q, sugBox), 220);
  });
  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) sugBox.classList.add('open');
  });
  document.addEventListener('click', (e) => {
    if (!input.closest('.filter-search-wrap')?.contains(e.target)) sugBox.classList.remove('open');
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') sugBox.classList.remove('open');
  });
}
function fetchSuggestions(q, box) {
  fetch(`/api/search?q=${encodeURIComponent(q)}`)
    .then(r => r.json())
    .then(results => {
      if (!results.length) { box.classList.remove('open'); return; }
      box.innerHTML = `
        <div class="suggestion-header">
          ${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"
          <a href="/vault?search=${encodeURIComponent(q)}">See all →</a>
        </div>
        ${results.map(p => `<a href="/product/${p.id}" class="suggestion-item">${p.name}</a>`).join('')}
      `;
      box.classList.add('open');
    });
}