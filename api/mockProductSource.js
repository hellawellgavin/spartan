/**
 * Mock product source: reads from local JSON in data/products/<category>.json.
 * Used when PRODUCT_SOURCE=mock (default). Same payload shape as live.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'products');

function getProductsByCategory(category) {
  const filePath = path.join(DATA_DIR, `${category}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return {
      category: data.category || category,
      products: Array.isArray(data.products) ? data.products : [],
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { category, products: [] };
    }
    throw err;
  }
}

module.exports = {
  getProductsByCategory,
};
