/**
 * Product detail page: loads a single product from API (mock or live).
 * Same API shape as when wired to Amazon: GET /api/product/:category/:id → { product }.
 */
(function () {
  const container = document.querySelector('[data-product-detail]');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const id = params.get('id');

  function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = String(s);
    return div.innerHTML;
  }

  function formatPrice(price) {
    if (price == null) return '';
    if (typeof price === 'string') return price;
    if (typeof price === 'number') return '$' + price.toFixed(2);
    return String(price);
  }

  function hasProductUrl(url) {
    return url && typeof url === 'string' && url.trim().length > 0;
  }

  function renderDetailsRow(label, values) {
    if (!values || (Array.isArray(values) && values.length === 0)) return '';
    const text = Array.isArray(values) ? values.join(', ') : String(values);
    return `<div class="product-detail-row"><span class="product-detail-label">${escapeHtml(label)}</span><span class="product-detail-value">${escapeHtml(text)}</span></div>`;
  }

  function render(product) {
    const title = product.title || 'Product';
    document.title = title + ' – Souvenir Spartan';

    var summaryHtml = (product.summary || product.description)
      ? '<p class="product-detail-summary">' + escapeHtml(product.summary || product.description) + '</p>'
      : '';

    var detailsHtml = '';
    if (product.sizes && product.sizes.length) {
      detailsHtml += renderDetailsRow('Available sizes', product.sizes);
    }
    if (product.colors && product.colors.length) {
      detailsHtml += renderDetailsRow('Colors', product.colors);
    }
    if (product.details && Array.isArray(product.details)) {
      product.details.forEach(function (d) {
        if (d && d.label && d.value != null) {
          detailsHtml += renderDetailsRow(d.label, d.value);
        }
      });
    }
    if (detailsHtml) {
      detailsHtml = '<div class="product-detail-specs"><h3 class="product-detail-specs-title">Product details</h3>' + detailsHtml + '</div>';
    }

    var buyAttrs = hasProductUrl(product.productUrl)
      ? 'href="' + escapeHtml(product.productUrl) + '" target="_blank" rel="noopener noreferrer nofollow sponsored"'
      : 'href="#" aria-disabled="true"';
    var buyHtml = '<a ' + buyAttrs + ' class="product-detail-cta">Buy on Amazon</a>';

    container.innerHTML = `
      <nav class="product-detail-breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumb-sep">/</span>
        <a href="${escapeHtml(category || '')}.html">${escapeHtml(category ? category.charAt(0).toUpperCase() + category.slice(1) : '')}</a>
        <span class="breadcrumb-sep">/</span>
        <span>${escapeHtml(title)}</span>
      </nav>
      <div class="product-detail-layout">
        <div class="product-detail-image-wrap">
          <img src="${escapeHtml(product.imageUrl || '')}" alt="${escapeHtml(title)}" class="product-detail-image">
        </div>
        <div class="product-detail-info">
          <h1 class="product-detail-title">${escapeHtml(title)}</h1>
          <p class="product-detail-price">${escapeHtml(formatPrice(product.price))}</p>
          ${summaryHtml}
          ${detailsHtml}
          ${buyHtml}
        </div>
      </div>
    `;

    if (!hasProductUrl(product.productUrl)) {
      var btn = container.querySelector('.product-detail-cta');
      if (btn) {
        btn.addEventListener('click', function (e) { e.preventDefault(); });
        btn.classList.add('product-detail-cta-disabled');
      }
    }
  }

  function showError(msg) {
    container.innerHTML = '<p class="product-detail-error">' + escapeHtml(msg) + '</p>';
  }

  function load() {
    if (!category || !id) {
      showError('Missing category or product ID.');
      return;
    }

    const apiUrl = '/api/product/' + encodeURIComponent(category) + '/' + encodeURIComponent(id);

    fetch(apiUrl)
      .then(function (r) {
        if (r.ok) return r.json();
        if (r.status === 404) return null;
        return Promise.reject(new Error('API ' + r.status));
      })
      .then(function (data) {
        if (data && data.product) {
          render(data.product);
          return;
        }
        tryFallback();
      })
      .catch(function () {
        tryFallback();
      });
  }

  function tryFallback() {
    const fallbackUrl = '/data/products/' + encodeURIComponent(category) + '.json';
    fetch(fallbackUrl)
      .then(function (r) {
        if (!r.ok) return Promise.reject(new Error('Fallback ' + r.status));
        return r.json();
      })
      .then(function (data) {
        const list = data && Array.isArray(data.products) ? data.products : [];
        const product = list.find(function (p) { return p.id === id; });
        if (product) render(product);
        else showError('Product not found.');
      })
      .catch(function () {
        showError('Could not load product. Start the server (npm start) or check the URL.');
      });
  }

  load();
})();
