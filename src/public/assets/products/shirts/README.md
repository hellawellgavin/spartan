# Walmart Men's Graphic Tees - Product Collection

## Summary

This directory contains product data and images for 8 men's graphic tees from Walmart.com.

## ⚠️ Important: Placeholder Images

**Current Status:** The 8 shirt images (`shirt-1.jpg` through `shirt-8.jpg`) are currently **generic placeholder images** from Lorem Picsum.

**Why?** Walmart's website uses heavy JavaScript rendering that prevents automated scraping without a full headless browser setup. Due to WSL/Linux environment limitations (missing Chrome dependencies), automated image download couldn't be completed.

## 🎯 How to Get Real Product Images

### Option 1: Use the Browser Tool (Recommended)

1. Open `download-walmart-images.html` (located in project root) in your web browser
2. For each product listed:
   - Click "Open Product Page" to open the Walmart product page
   - Right-click on the main product image
   - Select "Copy image address"
   - Return to the HTML tool
   - Click "Paste & Download" button
3. Images will download automatically as `shirt-1.jpg`, `shirt-2.jpg`, etc.
4. Move downloaded images to this directory: `/home/gavin/spartan/src/public/assets/products/shirts/`

### Option 2: Manual Download

Visit each product URL below, right-click the main image, and save as `shirt-X.jpg`:

1. **Nirvana Smiley Striped Graphic Tee** - $16.98
   - https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134

2. **South Park Cartman Graphic Tee** - $19.99
   - https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438

3. **SpongeBob SquarePants Character Group Graphic Tee** - $12.98
   - https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676

4. **Netflix Stranger Things Logo Graphic Tee** - $12.98
   - https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774

5. **Nintendo 8-Bit Icons Graphic T-Shirt** - $12.99
   - https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283

6. **Rick & Morty Embroidered Graphic Tee** - $12.98
   - https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000

7. **Star Wars Most Impressive Graphic Tee** - $12.99
   - https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266

8. **Superman Shield Logo Graphic Tee** - $9.98
   - https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123

## Product Data

Complete product information is stored in:
- `walmart-shirts-data.json` - Full product details with titles, prices, URLs, ratings, and reviews

## Files in This Directory

```
shirts/
├── shirt-1.jpg through shirt-8.jpg (placeholder images - replace with real ones)
├── walmart-shirts-data.json (complete product data)
└── README.md (this file)
```

## Product Details

| ID | Title | Price | Rating | Reviews |
|----|-------|-------|--------|---------|
| 1 | Nirvana Smiley Striped Graphic Tee | $16.98 | 4.8⭐ | 4 |
| 2 | South Park Cartman Graphic Tee | $19.99 | 4.7⭐ | 154 |
| 3 | SpongeBob Character Group Graphic Tee | $12.98 | 1.0⭐ | 3 |
| 4 | Stranger Things Logo Graphic Tee | $12.98 | 4.5⭐ | 13 |
| 5 | Nintendo 8-Bit Icons Graphic T-Shirt | $12.99 | 5.0⭐ | 1 |
| 6 | Rick & Morty Embroidered Graphic Tee | $12.98 | 4.3⭐ | 6 |
| 7 | Star Wars Most Impressive Graphic Tee | $12.99 | - | 0 |
| 8 | Superman Shield Logo Graphic Tee | $9.98 | 4.5⭐ | 371 |

## Usage in Your App

```javascript
// Example: Load product data
import shirtsData from './data/products/walmart-shirts-data.json';

shirtsData.forEach(shirt => {
  console.log(`${shirt.title} - ${shirt.price}`);
  console.log(`Image: /assets/products/shirts/${shirt.imageFile}`);
  console.log(`Buy: ${shirt.productUrl}`);
});
```

## Notes

- All products are real items available on Walmart.com
- Prices are current as of February 11, 2026
- Product URLs link directly to Walmart product pages
- Sizes available: Most products S-3XL
- These are legitimate products for affiliate marketing

## Scripts Available

Several helper scripts are available in the project root:

1. `download-walmart-images.html` - Browser tool for easy image downloading
2. `download-images-puppeteer.js` - Automated script (requires Chrome dependencies)
3. `download_walmart_images.py` - Python scraper (Walmart blocks simple scraping)

---

**Last Updated:** February 11, 2026
