/**
 * Set the Associate Pick shoe (id 3NVecvV) image from Amazon by ASIN.
 * Run: node scripts/set-associate-shoe-image.js B0XXXXXXX
 * Get the ASIN by clicking "Buy on Amazon" for that product and copying the 10-character code from the URL (e.g. amazon.com/dp/B0XXXXXXX).
 * Requires: RAPIDAPI_KEY in .env (Axesso - Amazon Data Service on RapidAPI).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'axesso-amazon-data-service1.p.rapidapi.com';
const SHOES_PATH = path.join(__dirname, '../../public/data/products/shoes.json');
const ASSOCIATE_PICK_ID = '3NVecvV';

const ENDPOINTS_TO_TRY = [
  (asin) => `https://${RAPIDAPI_HOST}/amz/amazon-product-by-asin?asin=${encodeURIComponent(asin)}&domainCode=us`,
  (asin) => `https://${RAPIDAPI_HOST}/amz/amazon-product-details?asin=${encodeURIComponent(asin)}&domainCode=us`,
  (asin) => `https://${RAPIDAPI_HOST}/amz/product-details?asin=${encodeURIComponent(asin)}`,
];

function extractImageUrl(data) {
  if (!data || typeof data !== 'object') return null;
  const d = data;
  const from = d.imageUrl || d.image || d.img || d.mainImage || d.thumbnail
    || d.productImage || d.mediumImage
    || (d.images && (d.images[0] || d.images.primary || (Array.isArray(d.images) && d.images[0])));
  if (typeof from === 'string' && from.startsWith('http')) return from;
  if (from && from.url) return from.url;
  const inner = d.product || d.result || d.item || d.data;
  if (inner) return extractImageUrl(inner);
  return null;
}

async function fetchProductImage(asin) {
  const headers = { 'x-rapidapi-host': RAPIDAPI_HOST, 'x-rapidapi-key': RAPIDAPI_KEY };
  for (const urlFn of ENDPOINTS_TO_TRY) {
    try {
      const res = await fetch(urlFn(asin), { headers });
      if (!res.ok) continue;
      const data = await res.json();
      const imageUrl = extractImageUrl(data);
      if (imageUrl) return imageUrl;
    } catch (_) {
      continue;
    }
  }
  return null;
}

async function main() {
  const asin = (process.argv[2] || process.env.ASIN || '').trim();
  if (!asin) {
    console.error('Usage: node scripts/set-associate-shoe-image.js <ASIN>');
    console.error('Example: node scripts/set-associate-shoe-image.js B0F7M733H8');
    console.error('Get ASIN: click Buy on Amazon for the Associate Pick product, then copy the 10-character code from the URL (e.g. .../dp/B0XXXXXXX).');
    process.exit(1);
  }
  if (!RAPIDAPI_KEY) {
    console.error('Set RAPIDAPI_KEY in .env (Axesso - Amazon Data Service on RapidAPI).');
    process.exit(1);
  }

  const imageUrl = await fetchProductImage(asin);
  if (!imageUrl) {
    console.error('Could not fetch product image for ASIN', asin, '- check RAPIDAPI_KEY and Axesso product-details endpoint on RapidAPI.');
    process.exit(1);
  }

  const json = JSON.parse(fs.readFileSync(SHOES_PATH, 'utf8'));
  const product = (json.products || []).find((p) => p.id === ASSOCIATE_PICK_ID);
  if (!product) {
    console.error('Product with id', ASSOCIATE_PICK_ID, 'not found in', SHOES_PATH);
    process.exit(1);
  }

  product.imageUrl = imageUrl;
  fs.writeFileSync(SHOES_PATH, JSON.stringify(json, null, 2), 'utf8');
  console.log('Updated Associate Pick shoe image from Amazon. ASIN:', asin);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
