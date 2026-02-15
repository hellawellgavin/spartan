# Manual Walmart Product Image URL Extraction Guide

## Quick Method (5-10 minutes for all 8)

For each product URL below, follow these steps:

1. **Open the product URL** in your browser
2. **Wait for the page to fully load** (you'll see the main product image)
3. **Right-click on the main/hero product image** (the large image on the left)
4. **Select "Inspect" or "Inspect Element"**
5. **In the inspector, the `<img>` tag should be highlighted**
6. **Look for the `src` attribute** - it will contain a URL like:
   `https://i5.walmartimages.com/asr/...` or `https://i5.walmartimages.com/seo/...`
7. **Copy that full URL**
8. **Paste it into the list below**

---

## Product URLs and Where to Save the Image URLs

### Product 1: Nirvana Smiley Striped Graphic Tee
- **URL**: https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134
- **Filename**: shirt-1.jpg
- **Image CDN URL**: _[Paste here]_

### Product 2: South Park Cartman Tee
- **URL**: https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438
- **Filename**: shirt-2.jpg
- **Image CDN URL**: _[Paste here]_

### Product 3: SpongeBob Character Group Tee
- **URL**: https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676
- **Filename**: shirt-3.jpg
- **Image CDN URL**: _[Paste here]_

### Product 4: Stranger Things Logo Tee
- **URL**: https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774
- **Filename**: shirt-4.jpg
- **Image CDN URL**: _[Paste here]_

### Product 5: Nintendo 8-Bit Icons Tee
- **URL**: https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283
- **Filename**: shirt-5.jpg
- **Image CDN URL**: _[Paste here]_

### Product 6: Rick & Morty Embroidered Tee
- **URL**: https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000
- **Filename**: shirt-6.jpg
- **Image CDN URL**: _[Paste here]_

### Product 7: Star Wars Darth Vader Tee
- **URL**: https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266
- **Filename**: shirt-7.jpg
- **Image CDN URL**: _[Paste here]_

### Product 8: Superman Shield Logo Tee
- **URL**: https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123
- **Filename**: shirt-8.jpg
- **Image CDN URL**: _[Paste here]_

---

## What the Image URLs Should Look Like

The URLs should follow this format:
```
https://i5.walmartimages.com/asr/[UUID].[UUID].[UUID]...jpg
```
or
```
https://i5.walmartimages.com/seo/[Product-Name]_[UUID]_[UUID]...jpg
```

Example:
```
https://i5.walmartimages.com/asr/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

---

## After You Have All 8 URLs

Once you have extracted all 8 image CDN URLs, you can either:

### Option A: Update shirts.json directly
Edit `/home/gavin/spartan/src/public/data/products/shirts.json` and replace each `imageUrl` with the corresponding CDN URL.

### Option B: Use a script to download them
Create a simple script that downloads each image from the CDN URL and saves it with the correct filename.

### Option C: Link directly to CDN (Recommended)
Update your `shirts.json` to use the CDN URLs directly instead of local files. This way:
- Images are always up-to-date with Walmart
- You don't host copyrighted content
- Faster implementation
- Less storage needed

---

## Alternative: Browser DevTools Network Tab Method

1. Open product URL in browser
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by **Images** (or search for "walmartimages")
5. Look for the large product image file (usually largest file size)
6. Right-click the request → **Copy URL**

This is often faster than inspecting the element!

---

## Why Automated Extraction Failed

Walmart uses:
- Client-side JavaScript rendering (React/Next.js)
- Dynamic content loading
- Anti-bot detection
- Images loaded after initial page load

This requires:
- Full headless browser (Chromium/Chrome)
- JavaScript execution
- Proper headers and timing
- Chrome dependencies (not available in WSL2 environment)

---

**Time estimate**: 1-2 minutes per product = 10-15 minutes total for all 8
