/**
 * One-time script: fetch real Amazon shoe products (with real images) from Axesso/RapidAPI
 * and write them to data/products/shoes.json. Run with: node scripts/refresh-shoes-from-axesso.js
 * Requires: RAPIDAPI_KEY in .env (get free key at rapidapi.com, subscribe to Axesso Amazon Data Service BASIC).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'axesso-amazon-data-service1.p.rapidapi.com';
const TAG = process.env.AMAZON_ASSOCIATE_TAG || 'souvenirspartan-20';

if (!RAPIDAPI_KEY) {
  console.error('Set RAPIDAPI_KEY in .env. Get it from https://rapidapi.com/axesso/api/axesso-amazon-data-service1 (subscribe to BASIC for free tier).');
  process.exit(1);
}

const url = `https://${RAPIDAPI_HOST}/amz/amazon-search?keyword=${encodeURIComponent("men's dress shoes")}&domainCode=us`;

fetch(url, {
  headers: { 'x-rapidapi-host': RAPIDAPI_HOST, 'x-rapidapi-key': RAPIDAPI_KEY },
})
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status + ' ' + r.statusText))))
  .then((data) => {
    const raw = data?.searchResults?.products || data?.products || data?.items || (Array.isArray(data) ? data : []);
    const products = (Array.isArray(raw) ? raw : []).slice(0, 10).map((item, i) => {
      const asin = item.asin || item.ASIN || item.id || '';
      const title = item.title || item.productTitle || item.name || 'Shoe';
      let price = item.price?.raw ?? item.price ?? item.formattedPrice ?? '';
      if (price && typeof price === 'object' && price.displayAmount) price = price.displayAmount;
      if (typeof price === 'number') price = '$' + price.toFixed(2);
      if (!price) price = 'Price varies';
      let imageUrl = item.imageUrl || item.image || item.img || item.mainImage || item.thumbnail || '';
      if (item.images && (item.images[0] || item.images.primary)) imageUrl = imageUrl || item.images[0] || item.images.primary;
      let productUrl = item.url || item.link || item.productUrl || (asin ? `https://www.amazon.com/dp/${asin}` : '');
      if (productUrl && TAG && !productUrl.includes('tag=')) productUrl += (productUrl.includes('?') ? '&' : '?') + 'tag=' + encodeURIComponent(TAG);
      return {
        id: asin || 'shoe-' + (i + 1),
        title: title || 'Product',
        price: String(price),
        imageUrl: imageUrl || '',
        productUrl: productUrl || '',
        summary: '',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Black', 'Brown'],
        details: [{ label: 'Material', value: 'Varies' }, { label: 'Fit', value: 'See product' }],
      };
    });

    const out = { category: 'shoes', products };
    const outPath = path.join(__dirname, '..', 'data', 'products', 'shoes.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote', products.length, 'shoes to data/products/shoes.json with real Amazon images and links.');
  })
  .catch((err) => {
    console.error('Axesso fetch failed:', err.message);
    process.exit(1);
  });
