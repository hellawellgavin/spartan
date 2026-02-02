/**
 * Product source abstraction.
 * Same interface for mock (local JSON) and live (Amazon PA-API).
 * Frontend always receives { category, products: [{ id, title, price, imageUrl, productUrl }] }.
 */

const mockProductSource = require('./mockProductSource');
const amazonProductSource = require('./amazonProductSource');

const VALID_CATEGORIES = ['shoes', 'shirts', 'pants', 'merch', 'travel', 'collectables'];

function getProductSource() {
  const source = (process.env.PRODUCT_SOURCE || 'mock').toLowerCase();
  if (source === 'amazon') {
    return amazonProductSource;
  }
  return mockProductSource;
}

async function getProductsByCategory(category) {
  const normalized = (category || '').toLowerCase().trim();
  if (!VALID_CATEGORIES.includes(normalized)) {
    return { category: normalized, products: [] };
  }
  const source = getProductSource();
  return source.getProductsByCategory(normalized);
}

module.exports = {
  getProductSource,
  getProductsByCategory,
  VALID_CATEGORIES,
};
