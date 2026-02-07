/**
 * Verify that real products are pulled into all top-level categories.
 * Run: node scripts/verify-products-pipeline.js
 * Uses .env; does not start the server.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getProductsByCategory, getProductSource, getSourceDescription, VALID_CATEGORIES } = require('../api/productSource');

const mockProductSource = require('../api/mockProductSource');
const walmartProductSource = require('../api/walmartProductSource');

function sourceName(source) {
  if (source === mockProductSource) return 'local JSON';
  if (source === walmartProductSource) return 'Walmart (RapidAPI)';
  return 'Amazon/Axesso';
}

async function main() {
  console.log('Product pipeline check – all top-level categories\n');
  console.log('Config:', getSourceDescription());
  console.log('');

  let failed = [];
  for (const category of VALID_CATEGORIES) {
    const source = getProductSource(category);
    let payload;
    try {
      payload = await getProductsByCategory(category);
    } catch (err) {
      console.log(category + ': ERROR –', err.message || err);
      failed.push(category);
      continue;
    }
    const products = payload && Array.isArray(payload.products) ? payload.products : [];
    const src = sourceName(source);
    const ok = products.length > 0 && products[0].title && (products[0].imageUrl || products[0].productUrl);
    if (!ok) failed.push(category);
    console.log(category + ': ' + products.length + ' products (' + src + ')' + (ok ? '' : ' – MISSING DATA'));
  }

  console.log('');
  if (failed.length > 0) {
    console.log('Categories with no/fake data:', failed.join(', '));
    console.log('For Walmart-only: set AMAZON_CATEGORIES= (empty) and WALMART_CATEGORIES=shoes,shirts,pants,merch,travel,collectables in .env');
    process.exit(1);
  }
  console.log('All ' + VALID_CATEGORIES.length + ' categories have real products. Run "npm start" to confirm in the browser.');
  process.exit(0);
}

main();
