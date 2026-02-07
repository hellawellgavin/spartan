/**
 * Axesso (RapidAPI) product source for real Amazon data including images.
 * Used when RAPIDAPI_KEY is set and Amazon PA-API is not (e.g. before qualifying sales).
 * Free tier: 50 requests/month on Axesso BASIC plan.
 *
 * Set in .env: RAPIDAPI_KEY, and optionally RAPIDAPI_HOST=axesso-amazon-data-service1.p.rapidapi.com
 */

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'souvenirspartan-20';
const CATEGORY_KEYWORDS = {
  shoes: "men's dress shoes",
  shirts: "men's polo shirt",
  pants: "men's dress slacks",
  merch: "leather briefcase",
  travel: "travel duffel bag",
  collectables: "collectible figurine",
};

function getProductsByCategory(category) {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST || 'axesso-amazon-data-service1.p.rapidapi.com';

  if (!key) {
    return Promise.resolve({ category, products: [] });
  }

  const keyword = CATEGORY_KEYWORDS[category] || category;
  const url = `https://${host}/amz/amazon-search?keyword=${encodeURIComponent(keyword)}&domainCode=us`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': host,
      'x-rapidapi-key': key,
    },
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
    .then((data) => {
      const products = mapAxessoResponseToProducts(data, ASSOCIATE_TAG);
      return { category, products };
    })
    .catch((err) => {
      console.warn('Axesso/RapidAPI search error:', err.message || err);
      return { category, products: [] };
    });
}

/**
 * Map Axesso response to our product shape. Handles common response structures.
 */
function mapAxessoResponseToProducts(data, tag) {
  const items = data?.searchResults?.products ||
    data?.products ||
    data?.items ||
    (Array.isArray(data) ? data : []);
  if (!Array.isArray(items)) return [];

  return items.slice(0, 12).map((item, i) => {
    const asin = item.asin || item.ASIN || item.id || '';
    const title = item.title || item.productTitle || item.name || '';
    const price = item.price?.raw ?? item.price ?? item.listPrice ?? item.formattedPrice ?? 'Price varies';
    const priceStr = typeof price === 'string' ? price : (price && price.displayAmount) || (typeof price === 'number' ? '$' + price.toFixed(2) : 'Price varies');
    let imageUrl = item.imageUrl || item.image || item.img || item.mainImage || item.thumbnail || '';
    if (item.images && (item.images[0] || item.images.primary)) {
      imageUrl = imageUrl || item.images[0] || item.images.primary;
    }
    let productUrl = item.url || item.link || item.productUrl || item.detailPageURL || '';
    if (asin && !productUrl) productUrl = `https://www.amazon.com/dp/${asin}`;
    if (productUrl && tag && !productUrl.includes('tag=')) {
      productUrl += (productUrl.includes('?') ? '&' : '?') + 'tag=' + encodeURIComponent(tag);
    }
    return {
      id: asin || 'axesso-' + i,
      title: title || 'Product',
      price: priceStr,
      imageUrl: imageUrl || '',
      productUrl: productUrl || '',
    };
  });
}

/**
 * Get single product by id (ASIN). Fetches list and finds match, or returns from cache.
 */
async function getProductByCategoryAndId(category, id) {
  const { products } = await getProductsByCategory(category);
  const product = products.find((p) => p.id === id);
  if (product) {
    return { ...product, summary: '', sizes: [], colors: [], details: [] };
  }
  return null;
}

module.exports = {
  getProductsByCategory,
  getProductByCategoryAndId,
};
