# Souvenir Spartan

Affiliate-style product site with mock data and optional Amazon Product Advertising API (PA-API) integration.

## Run the site (mock products)

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open http://localhost:3000

The server serves the static site and the product API. With default settings, products come from local JSON in `data/products/` (mock). Category pages load products via `GET /api/products/:category` and render them; each product links to `productUrl` (affiliate link when using live Amazon).

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

## Docs

- [Affiliate setup and PA-API details](docs/AFFILIATE_SETUP.md)
