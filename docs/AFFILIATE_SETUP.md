# Souvenir Spartan – Affiliate Product API

## Best approach for affiliate revenue

### 1. **Amazon Product Advertising API (PA-API 5.0)**

- **What it is:** Amazon’s official API for Associates. It returns product data (title, price, images, detail URL) so you can build product listings and link to Amazon with your Associate tag so you earn commission on sales.
- **Requirements:**
  - Join [Amazon Associates](https://affiliate-program.amazon.com/).
  - Get approved and then [register for PA-API](https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html) from your Associates account (Tools → Product Advertising API). You get **Access Key** and **Secret Key**.
  - Use your **Associate tag** in every product link so clicks/sales are attributed to you.
- **Limits:** Typically 1 request/second and 8,640 requests/day to start; limits can increase with qualifying sales.
- **Revenue:** You earn commission when users click your links and buy on Amazon within the cookie window (e.g. 24 hours). Use PA-API to search by category/keywords and build links with your tag.

### 2. **Architecture used in this project**

- **Single product API:** The site calls one backend: `GET /api/products/:category`.
- **Product source abstraction:** The API does **not** talk to the frontend about “mock” vs “live.” It has two backends:
  - **Mock (default):** Reads from local JSON in `data/products/<category>.json`. Used for development and when no Amazon credentials are set.
  - **Live (Amazon):** When `PRODUCT_SOURCE=amazon` and credentials are set, the API calls Amazon PA-API 5.0, maps results to the same JSON shape, and returns them. The frontend does not change.
- **Switching to live:** Set environment variables (see below), set `PRODUCT_SOURCE=amazon`, and restart the API server. The same frontend then shows real Amazon products and affiliate links.

### 3. **Product payload (same for mock and live)**

Every product from the API has this shape so the frontend can render one way for both:

- `id` – unique id (ASIN for Amazon)
- `title` – product name
- `price` – display string (e.g. `"$29.99"`) or raw number
- `imageUrl` – main image URL
- `productUrl` – link to the product (must include your Associate tag for Amazon)

### 4. **Enabling live Amazon (PA-API)**

1. Copy `.env.example` to `.env`.
2. In `.env` set:
   - `PRODUCT_SOURCE=amazon`
   - `AMAZON_ACCESS_KEY=` (from PA-API signup)
   - `AMAZON_SECRET_KEY=` (from PA-API signup)
   - `AMAZON_ASSOCIATE_TAG=` (from Associates account)
   - `AMAZON_REGION=` (e.g. `us-east-1` for North America)
3. Install deps and run the API server (see README). The server will use the Amazon product source and return live products and affiliate links.

### 5. **Category → Amazon search**

The API maps our category slugs to search keywords used for PA-API (e.g. “shoes” → “men’s dress shoes”). You can change those keywords in `services/amazonProductSource.js` to better match what you want to promote (e.g. “Spartan shirt,” “travel bag”).

### 6. **Other affiliate options**

- **RapidAPI / third‑party “Amazon” APIs:** Often against Amazon’s terms; prefer official PA-API.
- **Other networks (ShareASale, CJ, etc.):** Use their product feeds or APIs and add another adapter (e.g. `shareasaleProductSource.js`) that returns the same product shape; the rest of the app stays the same.
