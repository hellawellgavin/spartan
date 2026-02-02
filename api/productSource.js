/**
 * Product source abstraction.
 * Same interface for mock (local JSON) and live (Amazon PA-API).
 * Frontend always receives { category, products: [{ id, title, price, imageUrl, productUrl }] }.
 */

const mockProductSource = require('./mockProductSource');
const amazonProductSource = require('./amazonProductSource');

const VALID_CATEGORIES = ['shoes', 'shirts', 'pants', 'merch', 'travel', 'collectables'];

/** Categories that use Amazon PA-API when credentials are set. Default: shoes only. */
const AMAZON_CATEGORIES = (process.env.AMAZON_CATEGORIES || 'shoes')
  .toLowerCase()
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAmazonConfigured() {
  return !!(
    process.env.AMAZON_ACCESS_KEY &&
    process.env.AMAZON_SECRET_KEY &&
    process.env.AMAZON_ASSOCIATE_TAG
  );
}

function getProductSource(category) {
  const normalized = (category || '').toLowerCase().trim();
  if (AMAZON_CATEGORIES.includes(normalized) && isAmazonConfigured()) {
    return amazonProductSource;
  }
  return mockProductSource;
}

async function getProductsByCategory(category) {
  const normalized = (category || '').toLowerCase().trim();
  if (!VALID_CATEGORIES.includes(normalized)) {
    return { category: normalized, products: [] };
  }
  const source = getProductSource(normalized);
  return source.getProductsByCategory(normalized);
}

async function getProductByCategoryAndId(category, id) {
  const normalized = (category || '').toLowerCase().trim();
  const productId = (id || '').toString().trim();
  if (!VALID_CATEGORIES.includes(normalized) || !productId) {
    return null;
  }
  const source = getProductSource(normalized);
  if (typeof source.getProductByCategoryAndId !== 'function') {
    const { products } = await source.getProductsByCategory(normalized);
    return products.find((p) => p.id === productId) || null;
  }
  return source.getProductByCategoryAndId(normalized, productId);
}

function getSourceDescription() {
  if (!isAmazonConfigured()) return 'all categories: local';
  return `categories [${AMAZON_CATEGORIES.join(', ')}]: Amazon; others: local`;
}

module.exports = {
  getProductSource,
  getProductsByCategory,
  getProductByCategoryAndId,
  getSourceDescription,
  VALID_CATEGORIES,
};
