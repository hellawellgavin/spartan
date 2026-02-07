/**
 * Mock product source: reads from local JSON in data/products/<category>.json.
 * Used when PRODUCT_SOURCE=mock (default). Same payload shape as live.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'products');
const PRODUCTS_PER_PAGE = 8;

function getProductsByCategory(category, page = 1) {
  const filePath = path.join(DATA_DIR, `${category}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const allProducts = Array.isArray(data.products) ? data.products : [];
    
    // Apply pagination to mock data too
    const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
    const startIdx = (page - 1) * PRODUCTS_PER_PAGE;
    const products = allProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
    
    return {
      category: data.category || category,
      products,
      page,
      totalPages,
      totalProducts: allProducts.length,
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { category, products: [], page: 1, totalPages: 0 };
    }
    throw err;
  }
}

function getProductByCategoryAndId(category, id) {
  // Get all products without pagination for detail lookup
  const filePath = path.join(DATA_DIR, `${category}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const allProducts = Array.isArray(data.products) ? data.products : [];
    const product = allProducts.find((p) => p.id === id);
    return product || null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getProductsByCategory,
  getProductByCategoryAndId,
};
