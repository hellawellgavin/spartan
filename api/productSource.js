/**
 * Product source abstraction.
 * Same interface for mock (local JSON) and live (Amazon PA-API).
 * Frontend always receives { category, products: [{ id, title, price, imageUrl, productUrl }] }.
 */

const mockProductSource = require('./mockProductSource');
const amazonProductSource = require('./amazonProductSource');
const axessoProductSource = require('./axessoProductSource');
const walmartProductSource = require('./walmartProductSource');

const VALID_CATEGORIES = ['shoes', 'shirts', 'pants', 'merch', 'travel', 'collectables'];

/** Categories that use Amazon (PA-API or Axesso). When empty, no categories use Amazon. */
const AMAZON_CATEGORIES = (process.env.AMAZON_CATEGORIES || '')
  .toLowerCase()
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** Categories that use Walmart. When RAPIDAPI_KEY is set and this is unset, default to all categories so Shoes etc. load from Walmart. */
function getWalmartCategories() {
  const raw = process.env.WALMART_CATEGORIES;
  if (raw && raw.trim()) {
    return raw.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (process.env.RAPIDAPI_KEY) {
    return ['shoes', 'shirts', 'pants', 'merch', 'travel', 'collectables'];
  }
  return [];
}
const WALMART_CATEGORIES = getWalmartCategories();

function isAmazonConfigured() {
  return !!(
    process.env.AMAZON_ACCESS_KEY &&
    process.env.AMAZON_SECRET_KEY &&
    process.env.AMAZON_ASSOCIATE_TAG
  );
}

function isRapidApiConfigured() {
  return !!process.env.RAPIDAPI_KEY;
}

function getProductSource(category) {
  const normalized = (category || '').toLowerCase().trim();
  
  // Walmart first if explicitly listed
  if (WALMART_CATEGORIES.includes(normalized) && isRapidApiConfigured()) {
    return walmartProductSource;
  }
  
  // Amazon PA-API if configured and in AMAZON_CATEGORIES
  if (AMAZON_CATEGORIES.includes(normalized) && isAmazonConfigured()) {
    return amazonProductSource;
  }
  
  // Axesso (Amazon via RapidAPI) if in AMAZON_CATEGORIES and RapidAPI key set
  if (AMAZON_CATEGORIES.includes(normalized) && isRapidApiConfigured()) {
    return axessoProductSource;
  }
  
  // If RapidAPI key is set and category is NOT in AMAZON_CATEGORIES, use Walmart as default
  if (isRapidApiConfigured() && !AMAZON_CATEGORIES.includes(normalized)) {
    return walmartProductSource;
  }
  
  return mockProductSource;
}

async function getProductsByCategory(category, page = 1) {
  const normalized = (category || '').toLowerCase().trim();
  if (!VALID_CATEGORIES.includes(normalized)) {
    return { category: normalized, products: [], page: 1, totalPages: 0 };
  }
  const source = getProductSource(normalized);
  
  // All sources now support pagination
  return source.getProductsByCategory(normalized, page);
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
  const parts = [];
  if (AMAZON_CATEGORIES.length && (isAmazonConfigured() || isRapidApiConfigured())) {
    const src = isAmazonConfigured() ? 'Amazon PA-API' : 'Axesso (Amazon)';
    parts.push(`[${AMAZON_CATEGORIES.join(', ')}]: ${src}`);
  }
  if (WALMART_CATEGORIES.length && isRapidApiConfigured()) {
    parts.push(`[${WALMART_CATEGORIES.join(', ')}]: Walmart (RapidAPI)`);
  }
  if (parts.length) return `categories ${parts.join('; ')}; others: local`;
  return 'all categories: local';
}

module.exports = {
  getProductSource,
  getProductsByCategory,
  getProductByCategoryAndId,
  getSourceDescription,
  VALID_CATEGORIES,
};
