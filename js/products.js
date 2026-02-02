/**
 * Category product grid: loads from API (mock or live) or fallback to static JSON.
 * Same payload shape: { category, products: [{ id, title, price, imageUrl, productUrl }] }.
 */
(function () {
  const grid = document.querySelector('.product-grid[data-load-products]');
  const category = grid && grid.getAttribute('data-category');
  if (!grid || !category) return;

  const apiUrl = '/api/products/' + encodeURIComponent(category);
  const fallbackUrl = '/data/products/' + encodeURIComponent(category) + '.json';

  function render(products) {
    grid.innerHTML = products
      .map(
        (p) => `
      <article class="product-card">
        <a href="${escapeHtml(p.productUrl || '#')}" target="_blank" rel="noopener noreferrer sponsored">
          <img src="${escapeHtml(p.imageUrl || '')}" alt="${escapeHtml(p.title || '')}" loading="lazy">
          <div class="product-info">
            <h3 class="product-name">${escapeHtml(p.title || '')}</h3>
            <span class="product-price">${escapeHtml(formatPrice(p.price))}</span>
          </div>
        </a>
      </article>
    `
      )
      .join('');
  }

  function showError(msg) {
    grid.innerHTML = '<p class="products-error" style="grid-column:1/-1;color:var(--gold);">' + escapeHtml(msg) + '</p>';
  }

  function formatPrice(price) {
    if (price == null) return '';
    if (typeof price === 'string') return price;
    if (typeof price === 'number') return '$' + price.toFixed(2);
    return String(price);
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function load() {
    fetch(apiUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('API ' + r.status))))
      .then((data) => {
        const list = data && Array.isArray(data.products) ? data.products : [];
        if (list.length) render(list);
        else tryFallback();
      })
      .catch(() => tryFallback());
  }

  function tryFallback() {
    fetch(fallbackUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Fallback ' + r.status))))
      .then((data) => {
        const list = data && Array.isArray(data.products) ? data.products : [];
        if (list.length) render(list);
        else showError('No products available. Start the server for API or ensure data files are served.');
      })
      .catch(() =>
        showError('Could not load products. Start the server (npm start) or serve this folder with /data/ available.')
      );
  }

  load();
})();
