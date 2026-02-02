/**
 * Live product source: Amazon Product Advertising API 5.0.
 * Used when PRODUCT_SOURCE=amazon and credentials are set.
 * Maps PA-API response to same shape as mock: { id, title, price, imageUrl, productUrl }.
 *
 * To enable:
 * 1. Join Amazon Associates and register for PA-API (Tools → Product Advertising API).
 * 2. Set in .env: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOCIATE_TAG, AMAZON_REGION.
 * 3. Install PA-API client: npm install paapi5-nodejs-sdk (or use fetch with PA-API 5.0 REST).
 * 4. Implement searchItems() below using PA-API SearchItems and map results to product shape.
 */

const CATEGORY_KEYWORDS = {
  shoes: "men's dress shoes",
  shirts: "men's polo shirt",
  pants: "men's dress slacks",
  merch: "leather briefcase men's accessories",
  travel: "travel duffel bag",
  collectables: "collectible figurine",
};

function getProductsByCategory(category) {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG;

  if (!accessKey || !secretKey || !associateTag) {
    console.warn(
      'Amazon PA-API: missing AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, or AMAZON_ASSOCIATE_TAG. Add to .env and restart.'
    );
    return Promise.resolve({ category, products: [] });
  }

  const keywords = CATEGORY_KEYWORDS[category] || category;
  return searchItems(keywords, associateTag).then((items) => ({
    category,
    products: items,
  }));
}

/**
 * Call Amazon Product Advertising API 5.0 SearchItems.
 * Returns array of { id, title, price, imageUrl, productUrl }.
 * Requires: npm install paapi5-nodejs-sdk
 */
async function searchItems(keywords, associateTag) {
  let ProductAdvertisingAPIv1;
  try {
    ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');
  } catch (e) {
    console.warn('Amazon PA-API: paapi5-nodejs-sdk not installed. Run: npm install paapi5-nodejs-sdk');
    return [];
  }

  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const region = process.env.AMAZON_REGION || 'us-east-1';

  const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
  defaultClient.accessKey = accessKey;
  defaultClient.secretKey = secretKey;
  defaultClient.host = 'webservices.amazon.com';
  defaultClient.region = region;

  const api = new ProductAdvertisingAPIv1.DefaultApi();
  const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
  searchRequest['PartnerTag'] = associateTag;
  searchRequest['PartnerType'] = 'Associates';
  searchRequest['Keywords'] = keywords;
  searchRequest['SearchIndex'] = 'All';

  return new Promise((resolve) => {
    api.searchItems(searchRequest, (err, data) => {
      if (err) {
        console.error('Amazon PA-API SearchItems error:', err.message || err);
        return resolve([]);
      }
      const items = data?.SearchResult?.Items || [];
      const products = items.map((item) => {
        const info = item.ItemInfo?.Title?.DisplayValue || '';
        const offers = item.Offers?.Listings?.[0];
        const price = offers?.Price?.DisplayAmount || 'Price varies';
        const images = item.Images?.Primary;
        const imageUrl = images?.Medium?.URL || images?.Large?.URL || '';
        let productUrl = item.DetailPageURL || '';
        if (productUrl && associateTag && !productUrl.includes('tag=')) {
          productUrl += (productUrl.includes('?') ? '&' : '?') + 'tag=' + encodeURIComponent(associateTag);
        }
        return {
          id: item.ASIN || item.Id || '',
          title: info,
          price,
          imageUrl,
          productUrl,
        };
      });
      resolve(products);
    });
  });
}

module.exports = {
  getProductsByCategory,
};
