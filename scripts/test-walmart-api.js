/**
 * Verify Walmart RapidAPI retrieves products (no fallback).
 * Run: node scripts/test-walmart-api.js
 * Uses RAPIDAPI_KEY and WALMART_* from .env. Ensures productSource returns real Walmart products.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { getProductsByCategory, getSourceDescription } = require('../api/productSource');

(async () => {
  console.log('Walmart-only product check\n');
  console.log('Config:', getSourceDescription());

  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    console.error('\nNo RAPIDAPI_KEY in .env');
    process.exit(1);
  }

  const walmartCats = (process.env.WALMART_CATEGORIES || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (walmartCats.length === 0) {
    console.log('\nSet WALMART_CATEGORIES in .env (e.g. shoes,shirts,pants) to use only Walmart.');
    process.exit(1);
  }
  const category = walmartCats[0];
  const payload = await getProductsByCategory(category);
  const products = payload?.products || [];

  if (products.length === 0) {
    console.log('\nNo products for', category + '. Check RAPIDAPI_KEY and RapidAPI subscription (Axesso - Walmart Data Service).');
    process.exit(1);
  }

  console.log('\nProducts retrieved:', products.length);
  console.log('Sample:', products[0]?.title?.substring(0, 50) + '...');
  console.log('  Price:', products[0]?.price, '| URL:', products[0]?.productUrl ? 'yes' : 'no');
  console.log('\nWalmart API is working. Run "npm start" and open a category in WALMART_CATEGORIES.');
  process.exit(0);
})();
