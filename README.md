# Souvenir Spartan

Affiliate-style product site: mock data, or real products via **Walmart** (RapidAPI) or **Amazon** (PA-API).

## Run the site locally (real products – Walmart)

1. **Install:** `npm install`
2. **Configure:** Copy `.env.example` to `.env`. Set:
   - `RAPIDAPI_KEY=` your key from [Axesso - Walmart Data Service](https://rapidapi.com/axesso/api/axesso-walmart-data-service) (subscribe to the free tier).
   - `WALMART_CATEGORIES=shoes,shirts,pants,merch,travel,collectables` (include `shoes` so Shoes uses Walmart and real images).
   - `AMAZON_CATEGORIES=` leave empty so only Walmart is used.
3. **Start:** `npm start`
4. **Open:** http://localhost:3000 — click any category to see real Walmart products.

To confirm before starting: `node scripts/test-walmart-api.js`. To verify all six categories: `node scripts/verify-products-pipeline.js`.

## Run the site (mock products only)

If you skip `.env` or don’t set `RAPIDAPI_KEY`, products come from local JSON in `data/products/`. Same steps: `npm install`, `npm start`, open http://localhost:3000.

## Switch to live Amazon products

1. Join [Amazon Associates](https://affiliate-program.amazon.com/) and get approved.
2. In your Associates account: **Tools → Product Advertising API** and register for PA-API to get **Access Key** and **Secret Key**. Note your **Associate tag**.
3. Copy `.env.example` to `.env` and set:
   - `PRODUCT_SOURCE=amazon`
   - `AMAZON_ACCESS_KEY=...`
   - `AMAZON_SECRET_KEY=...`
   - `AMAZON_ASSOCIATE_TAG=...`
   - `AMAZON_REGION=us-east-1` (or your marketplace)
4. Install the PA-API SDK: `npm install paapi5-nodejs-sdk`
5. Restart: `npm start`

Category pages will then pull live products from Amazon; product links will include your Associate tag for affiliate attribution.

## API

- **GET /api/products/:category**  
  Returns `{ category, products: [{ id, title, price, imageUrl, productUrl }] }`.  
  Category must be one of: `shoes`, `shirts`, `pants`, `merch`, `travel`, `collectables`.

## Mock data

Edit JSON files in `data/products/` (e.g. `shoes.json`, `shirts.json`) to change mock products. Each file has `{ "category": "...", "products": [ { "id", "title", "price", "imageUrl", "productUrl" }, ... ] }`.

