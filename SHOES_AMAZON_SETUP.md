# Pull Shoes from Amazon – Exact Steps

The **Shoes** category is already wired to Amazon in code. Each shoe in mock data has a **different** placeholder image; the **Buy on Amazon** links go to the correct product. For the Associate Pick (your Sitestripe link), use option 3 below to pull its image from Amazon. When not using that, use Option A, B, or C under “Getting real product images” below. When you add your PA-API credentials to `.env`, shoes will load from Amazon; other categories stay on local data.

---

## Testing without PA-API (no qualifying sales yet)

**Amazon requires qualifying sales** before you can use the Product Advertising API. You can still test the full flow today:

1. **Don’t add any Amazon keys to `.env`** (or leave them empty). Shoes will load from the **local mock data**.
2. **Mock shoes use real Amazon products.** The list in `data/products/shoes.json` has real ASINs and real product URLs. When you click a shoe and then **Buy on Amazon**, you go to the real Amazon product page.
3. **Run the site:**  
   `npm start` → open **http://localhost:3000** → open **Shoes**. Browse, open a product, click **Buy on Amazon** to confirm the link works.
4. **When you get PA-API access** (after meeting Amazon’s sales requirement), add your Access Key, Secret Key, and Associate Tag to `.env` and restart. Shoes will then pull from the live API; the same product URLs and ASINs will work with the API.

No extra accounts or keys are required for this testing setup. When you get an Associate Tag, you can replace `souvenirspartan-20` in the product URLs in `data/products/shoes.json` with your tag so your test clicks use your affiliate link.

### Getting real product images (without PA-API)

To have **real Amazon product images** in the shoes category before you have PA-API access:

1. **Option A – Live from RapidAPI (Axesso)**  
   Sign up at [RapidAPI](https://rapidapi.com/) and subscribe to **Axesso - Amazon Data Service** (free BASIC plan: 50 requests/month). Copy your **RapidAPI Key**, then in `.env` add:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```
   Restart the server (`npm start`). The shoes category will then load from Axesso with real titles, prices, and **real product images**.

2. **Option B – One-time refresh of mock data**  
   With `RAPIDAPI_KEY` set, run:
   ```bash
   node scripts/refresh-shoes-from-axesso.js
   ```
   This overwrites `data/products/shoes.json` with real Amazon shoe data (including image URLs) from Axesso. After that, the site will show real product images even when the server is not using Axesso (e.g. no RAPIDAPI_KEY in production).

3. **Associate Pick image from Amazon (the one product whose Buy button works)**  
   For the single product that uses your Sitestripe link (amzn.to/3NVecvV), get its real Amazon image: click **Buy on Amazon** for that product, then in the address bar copy the **ASIN** (the 10-character code after `/dp/`, e.g. `B0XXXXXXX`). With `RAPIDAPI_KEY` set, run:
   ```bash
   node scripts/set-associate-shoe-image.js B0XXXXXXX
   ```
   Replace `B0XXXXXXX` with the ASIN you copied. The script fetches the product image from Axesso and updates that product in `shoes.json`.

4. **Option C – Enrich existing shoes with real images by ASIN**  
   To keep your current product list (same ASINs and titles) but replace placeholder images with real Amazon images, run:
   ```bash
   node scripts/enrich-shoes-images.js
   ```
   Requires `RAPIDAPI_KEY`. The script calls Axesso’s product-details-by-ASIN endpoint for each shoe in `shoes.json` and writes back the image URLs. Products that aren’t ASINs (e.g. the Associate Sitestripe link) are left unchanged. If the script reports “No image”, check the Axesso API’s **Endpoints** tab on RapidAPI for the exact “product by ASIN” or “product details” path and update `scripts/enrich-shoes-images.js` if needed.

---

## What’s already done (no action needed)

- API calls for shoes use Amazon Product Advertising API 5.0 (SearchItems for list, GetItems for detail).
- `.env` exists in the project root with placeholder variables; you only need to paste your keys.
- `paapi5-nodejs-sdk` is a project dependency; `npm install` will install it.

---

## What you must do (accounts and keys)

I cannot create accounts or see your credentials. Do these steps yourself:

### Step 1: Amazon Associates account

1. Go to: **https://affiliate-program.amazon.com/**
2. Click **Sign up** (or sign in with your Amazon account).
3. Complete the signup (site URL, profile, etc.). Approval can take a few days.
4. Only the **primary account holder** can use the Product Advertising API later.

### Step 2: Register for Product Advertising API

1. Sign in at **https://affiliate-program.amazon.com/**
2. In the top nav: **Tools** → **Product Advertising API**.
3. Click **Join** (or **Add Credentials** if you already joined).
4. Accept the terms. You’ll get to a page that shows **Access Key** and **Secret Key**.

### Step 3: Copy your keys

1. On the PA-API credentials page:
   - Copy **Access Key** (starts with `AKIA...`).
   - Copy **Secret Key** (long string; you may only see it once—save it).
2. In Associates: go to **Account** (or **Manage Your Account**) and find **Tracking ID** (Associate Tag), e.g. `yoursite-20`. Copy it.

### Step 4: Put keys into the project

1. Open the file **`.env`** in the project root (same folder as `server.js`).
2. Paste your values **after the `=`** on each line. No quotes, no extra spaces:

   ```env
   AMAZON_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
   AMAZON_SECRET_KEY=your_secret_key_here
   AMAZON_ASSOCIATE_TAG=yoursite-20
   AMAZON_REGION=us-east-1
   ```

3. Save the file. Do not commit `.env` or share it (it’s in `.gitignore`).

---

## What you must run

Run these in a terminal (e.g. in Cursor: **Terminal → New Terminal**):

```bash
cd c:\Users\Hella\spartan
npm install
npm start
```

- **`npm install`** – installs the PA-API SDK (and other dependencies).
- **`npm start`** – starts the server. You should see something like:  
  `categories [shoes]: Amazon; others: local`

Then open **http://localhost:3000**, go to **Shoes**. Products should load from Amazon.

---

## If something fails

| Problem | What to do |
|--------|------------|
| Shoes still show local products | Make sure `.env` has all three: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_ASSOCIATE_TAG` with no typos. Restart the server after editing `.env`. |
| “paapi5-nodejs-sdk not installed” | Run `npm install` in the project folder, then `npm start` again. |
| API error in server logs | Confirm your Associates account is **approved** and you joined **Product Advertising API** (not only Associates). Use the keys from the PA-API credentials page, not AWS IAM. |
| “InvalidClientTokenId” or “SignatureDoesNotMatch” | Double-check Access Key and Secret Key; no extra spaces or quotes in `.env`. |

---

## Summary

| Done by you | Done in code |
|-------------|----------------|
| Create Amazon Associates account | ✅ Shoes category uses PA-API when credentials are set |
| Join Product Advertising API | ✅ SearchItems for shoe list, GetItems for shoe detail |
| Copy Access Key, Secret Key, Associate Tag | ✅ `.env` template ready |
| Paste into `.env` and save | ✅ Other categories still use local JSON |
| Run `npm install` then `npm start` | |

Once your keys are in `.env` and the server is running, shoes are pulled from Amazon.
