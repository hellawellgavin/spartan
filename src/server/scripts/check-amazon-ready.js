/**
 * Check if your Amazon PA-API account is ready to display real products.
 * Run: node scripts/check-amazon-ready.js
 * Uses .env in project root. Does not print your keys.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const accessKey = process.env.AMAZON_ACCESS_KEY;
const secretKey = process.env.AMAZON_SECRET_KEY;
const associateTag = process.env.AMAZON_ASSOCIATE_TAG;
const region = process.env.AMAZON_REGION || 'us-east-1';

function hasVal(s) {
  return typeof s === 'string' && s.trim().length > 0;
}

console.log('Checking Amazon PA-API readiness...\n');

// 1. Credentials present?
if (!hasVal(accessKey) || !hasVal(secretKey) || !hasVal(associateTag)) {
  console.log('Missing credentials in .env:');
  if (!hasVal(accessKey)) console.log('  - AMAZON_ACCESS_KEY');
  if (!hasVal(secretKey)) console.log('  - AMAZON_SECRET_KEY');
  if (!hasVal(associateTag)) console.log('  - AMAZON_ASSOCIATE_TAG');
  console.log('\nAdd them from: Amazon Associates → Tools → Product Advertising API');
  console.log('Then run this script again.');
  process.exit(1);
}

console.log('Credentials:');
console.log('  AMAZON_ACCESS_KEY   ', accessKey ? `${accessKey.substring(0, 8)}...` : '(missing)');
console.log('  AMAZON_SECRET_KEY   ', secretKey ? '*** set ***' : '(missing)');
console.log('  AMAZON_ASSOCIATE_TAG', associateTag || '(missing)');
console.log('  AMAZON_REGION      ', region);
console.log('');

// 2. SDK installed?
let ProductAdvertisingAPIv1;
try {
  ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');
} catch (e) {
  console.log('PA-API SDK not installed. Run: npm install paapi5-nodejs-sdk');
  process.exit(1);
}

// 3. Call PA-API SearchItems
const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = accessKey;
defaultClient.secretKey = secretKey;
defaultClient.host = 'webservices.amazon.com';
defaultClient.region = region;

const api = new ProductAdvertisingAPIv1.DefaultApi();
const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
searchRequest['PartnerTag'] = associateTag;
searchRequest['PartnerType'] = 'Associates';
searchRequest['Keywords'] = "men's dress shoes";
searchRequest['SearchIndex'] = 'All';

api.searchItems(searchRequest, (err, data) => {
  if (err) {
    const msg = err.message || String(err);
    console.log('PA-API call failed. Your account is not ready for real products yet.\n');
    console.log('Error:', msg);
    if (msg.includes('InvalidClientTokenId') || msg.includes('SignatureDoesNotMatch')) {
      console.log('\n→ Check Access Key and Secret Key (no extra spaces/quotes in .env).');
      console.log('  Use the keys from: Product Advertising API credentials page (not AWS IAM).');
    } else if (msg.includes('TooManyRequests') || msg.includes('throttl')) {
      console.log('\n→ Rate limited. Wait a minute and try again.');
    } else {
      console.log('\n→ Ensure your Associates account is approved and you joined Product Advertising API.');
      console.log('  Associates → Tools → Product Advertising API → Join.');
    }
    process.exit(1);
  }

  const items = data?.SearchResult?.Items || [];
  console.log('Success. Your Amazon account is ready.\n');
  console.log('PA-API returned', items.length, 'items for "men\'s dress shoes".');
  if (items.length > 0) {
    const first = items[0];
    const title = first?.ItemInfo?.Title?.DisplayValue || '(no title)';
    console.log('Example:', title.substring(0, 60) + (title.length > 60 ? '...' : ''));
  }
  console.log('\nYou can run "npm start" and open Shoes — real products will load from Amazon.');
  process.exit(0);
});
