/**
 * Walmart product source via Axesso (RapidAPI).
 * Instant API access with your existing RapidAPI key — subscribe to "Axesso - Walmart Data Service"
 * on RapidAPI, then set WALMART_RAPIDAPI_HOST (or use default below).
 * Add WALMART_PARTNER_ID when your Walmart Affiliate account is approved (~1 day).
 *
 * .env: RAPIDAPI_KEY, WALMART_RAPIDAPI_HOST (optional), WALMART_PARTNER_ID (optional)
 */

const DEFAULT_HOST = 'axesso-walmart-data-service.p.rapidapi.com';
const CATEGORY_KEYWORDS = {
  shoes: "men's dress shoes casual sneakers oxford loafers",
  shirts: "men's graphic tees streetwear fashion shirts",
  pants: "men's pants trousers chinos joggers goodfellow dress casual",
  merch: "men's accessories watches wallets bags hats caps",
  travel: "travel bags backpacks luggage duffel carry-on",
  collectables: "collectibles figurines memorabilia vintage decor",
};

const PRODUCTS_PER_PAGE = 8;

function getProductsByCategory(category, page = 1) {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.WALMART_RAPIDAPI_HOST || DEFAULT_HOST;

  if (!key) {
    return Promise.resolve({ category, products: [], page: 1, totalPages: 0 });
  }

  const keyword = CATEGORY_KEYWORDS[category] || category;
  const searchPath = process.env.WALMART_SEARCH_PATH || '/wlm/walmart-search-by-keyword';
  const url = `https://${host}${searchPath}?keyword=${encodeURIComponent(keyword)}&page=${page}`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': host,
      'x-rapidapi-key': key,
    },
  })
    .then((res) => {
      if (!res.ok) {
        console.warn('Walmart API', res.status, '- check WALMART_RAPIDAPI_HOST and WALMART_SEARCH_PATH in .env');
        return Promise.reject(new Error(res.status + ' ' + res.statusText));
      }
      return res.json();
    })
    .then((data) => {
      const allProducts = mapWalmartResponseToProducts(data);
      const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
      const startIdx = (page - 1) * PRODUCTS_PER_PAGE;
      const products = allProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
      return { category, products, page, totalPages, totalProducts: allProducts.length };
    })
    .catch((err) => {
      console.warn('Walmart/RapidAPI search error:', err.message || err);
      return { category, products: [], page: 1, totalPages: 0 };
    });
}

/**
 * Extract product list from Axesso Walmart response.
 * API returns data.item.props.pageProps.initialData.searchResult.itemStacks[].items.
 */
function extractItemsFromAxessoResponse(data) {
  const item = data?.item;
  if (!item) return [];
  const searchResult = item?.props?.pageProps?.initialData?.searchResult;
  const stacks = searchResult?.itemStacks;
  if (!Array.isArray(stacks) || stacks.length === 0) return [];
  const items = stacks.flatMap((stack) => (Array.isArray(stack.items) ? stack.items : []));
  return items;
}

function mapWalmartResponseToProducts(data) {
  const partnerId = process.env.WALMART_PARTNER_ID || '';
  let items = extractItemsFromAxessoResponse(data);
  if (items.length === 0) {
    items =
      data?.searchResults?.products ||
      data?.products ||
      data?.items ||
      data?.payload?.products ||
      (Array.isArray(data) ? data : []);
  }
  if (!Array.isArray(items)) return [];

  return items.slice(0, 40).map((item, i) => {
    const id = item.usItemId || item.id || item.itemId || item.productId || 'walmart-' + i;
    const title = item.name || item.title || item.productTitle || '';
    const priceInfo = item.priceInfo;
    const priceDisplay = priceInfo?.linePriceDisplay || priceInfo?.linePrice || priceInfo?.itemPrice;
    let priceStr = typeof priceDisplay === 'string' ? priceDisplay : 'Price varies';
    if (priceStr === 'Price varies' && (item.price != null || priceInfo?.minPrice != null)) {
      const num = typeof item.price === 'number' ? item.price : priceInfo?.minPrice;
      if (typeof num === 'number') priceStr = '$' + num.toFixed(2);
    }
    let imageUrl = item.image || item.imageUrl || item.thumbnailUrl || item.mediumImage || '';
    if (item.images && (item.images[0] || item.images.primary)) {
      imageUrl = imageUrl || item.images[0] || item.images.primary;
    }
    let productUrl = item.productUrl || item.url || item.link || item.detailPageURL || '';
    if (!productUrl && item.canonicalUrl) {
      productUrl = item.canonicalUrl.startsWith('http') ? item.canonicalUrl : 'https://www.walmart.com' + item.canonicalUrl;
    }
    if (!productUrl && id) {
      productUrl = `https://www.walmart.com/ip/${String(id).replace(/\s+/g, '-')}`;
    }
    if (productUrl && partnerId && !productUrl.includes('wmlspartner=')) {
      productUrl += (productUrl.includes('?') ? '&' : '?') + 'wmlspartner=' + encodeURIComponent(partnerId);
    }
    const summary = item.description || item.shortDescription || '';
    return {
      id: String(id),
      title: title || 'Product',
      price: priceStr,
      imageUrl: imageUrl || '',
      productUrl: productUrl || '',
      summary: summary || undefined,
    };
  });
}

async function getProductByCategoryAndId(category, id) {
  const { products } = await getProductsByCategory(category);
  const product = products.find((p) => p.id === id);
  if (product) {
    return {
      ...product,
      summary: product.summary || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      details: product.details || [],
    };
  }
  return null;
}

module.exports = {
  getProductsByCategory,
  getProductByCategoryAndId,
};
