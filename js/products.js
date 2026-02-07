/**
 * Category product grid: loads from API (mock or live) with spinning logo loader.
 * Same payload shape: { category, products: [{ id, title, price, imageUrl, productUrl }] }.
 */
(function () {
  const grid = document.querySelector('.product-grid[data-load-products]');
  const category = grid && grid.getAttribute('data-category');
  if (!grid || !category) return;

  const apiUrl = '/api/products/' + encodeURIComponent(category);

  function showLoader() {
    grid.innerHTML = `
      <div class="products-loader">
        <img src="assets/spartan.png" alt="Loading..." class="loader-spinner">
        <p>Loading products...</p>
      </div>
    `;
  }

  function render(products) {
    grid.innerHTML = products
      .map(
        (p) => `
      <article class="product-card">
        <a href="product.html?category=${encodeURIComponent(category)}&id=${encodeURIComponent(p.id)}">
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
    showLoader();
    fetch(apiUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('API ' + r.status))))
      .then((data) => {
        const list = data && Array.isArray(data.products) ? data.products : [];
        if (list.length) render(list);
        else showError('No products available for this category.');
      })
      .catch(() => showError('Could not load products. Start the server (npm start).'));
  }

  load();
})();
