/**
 * Enrich data/products/shoes.json with real Amazon product images by ASIN.
 * Uses Axesso (RapidAPI) "product details" / "product by ASIN" endpoint when available.
 * Run: node scripts/enrich-shoes-images.js
 * Requires: RAPIDAPI_KEY in .env (same as refresh-shoes-from-axesso.js).
 *
 * Only products whose id looks like an ASIN (e.g. B0F7M733H8) are updated;
 * others (e.g. 3NVecvV) are left unchanged. Uses 1 request per ASIN.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'axesso-amazon-data-service1.p.rapidapi.com';

const SHOES_PATH = path.join(__dirname, '../../public/data/products/shoes.json');

// ASINs are 10 alphanumeric chars, often starting with B0
function looksLikeAsin(id) {
  return typeof id === 'string' && /^[A-Z0-9]{10}$/i.test(id.trim());
}

// Try common Axesso product-by-ASIN endpoint patterns (RapidAPI path may vary)
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
  // Nested in product or result
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
  if (!RAPIDAPI_KEY) {
    console.error('Set RAPIDAPI_KEY in .env. Same key as for refresh-shoes-from-axesso.js.');
    process.exit(1);
  }

  const raw = fs.readFileSync(SHOES_PATH, 'utf8');
  const json = JSON.parse(raw);
  const products = json.products || [];
  let updated = 0;

  for (const p of products) {
    if (!looksLikeAsin(p.id)) {
      console.log('Skip (not ASIN):', p.id);
      continue;
    }
    const imageUrl = await fetchProductImage(p.id);
    if (imageUrl) {
      p.imageUrl = imageUrl;
      updated++;
      console.log('OK', p.id);
    } else {
      console.log('No image for', p.id, '(endpoint may differ on RapidAPI – check Endpoints tab)');
    }
  }

  fs.writeFileSync(SHOES_PATH, JSON.stringify(json, null, 2), 'utf8');
  console.log('Done. Updated', updated, 'product images in', SHOES_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
