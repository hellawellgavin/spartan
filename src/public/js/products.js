/**
 * Category product grid: loads from API (mock or live) with spinning logo loader.
 * Same payload shape: { category, products: [{ id, title, price, imageUrl, productUrl }] }.
 * Supports pagination for API sources.
 */
(function () {
  const grid = document.querySelector('.product-grid[data-load-products]');
  const category = grid && grid.getAttribute('data-category');
  if (!grid || !category) return;

  let currentPage = 1;
  let totalPages = 1;

  const apiUrl = '/api/products/' + encodeURIComponent(category);

  function showLoader() {
    grid.innerHTML = `
      <div class="products-loader">
        <img src="assets/spartan.png" alt="Loading..." class="loader-spinner">
        <p>Loading products...</p>
      </div>
    `;
  }

  function render(products, page, pages) {
    currentPage = page || 1;
    totalPages = pages || 1;
    
    const productsHtml = products
      .map(
        (p) => `
      <article class="product-card">
        <a href="../product.html?category=${encodeURIComponent(category)}&id=${encodeURIComponent(p.id)}">
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

    const paginationHtml = totalPages > 1 ? `
      <div class="pagination">
        <button class="pagination-btn" id="prev-page" ${currentPage <= 1 ? 'disabled' : ''}>
          &laquo; Previous
        </button>
        <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
        <button class="pagination-btn" id="next-page" ${currentPage >= totalPages ? 'disabled' : ''}>
          Next &raquo;
        </button>
      </div>
    ` : '';

    grid.innerHTML = productsHtml + paginationHtml;

    // Add pagination event listeners
    if (totalPages > 1) {
      const prevBtn = document.getElementById('prev-page');
      const nextBtn = document.getElementById('next-page');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            load(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentPage < totalPages) {
            load(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
    }
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

  function load(page = 1) {
    showLoader();
    const url = `${apiUrl}?page=${page}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('API ' + r.status))))
      .then((data) => {
        const list = data && Array.isArray(data.products) ? data.products : [];
        const pages = data.totalPages || 1;
        const currentPg = data.page || 1;
        if (list.length) render(list, currentPg, pages);
        else showError('No products available for this category.');
      })
      .catch(() => showError('Could not load products. Start the server (npm start).'));
  }

  load();
})();
