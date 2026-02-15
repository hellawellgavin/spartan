const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

const products = [
  { url: "https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134", filename: "shirt-1.jpg" },
  { url: "https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438", filename: "shirt-2.jpg" },
  { url: "https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676", filename: "shirt-3.jpg" },
  { url: "https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774", filename: "shirt-4.jpg" },
  { url: "https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283", filename: "shirt-5.jpg" },
  { url: "https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000", filename: "shirt-6.jpg" },
  { url: "https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266", filename: "shirt-7.jpg" },
  { url: "https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123", filename: "shirt-8.jpg" }
];

const outputDir = '/home/gavin/spartan/src/public/assets/products/shirts';

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filepath);
          resolve(stats.size);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadProductImage(browser, product, index) {
  console.log(`\n[${ index}/8] ${product.filename}`);
  console.log(`URL: ${product.url}`);
  
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('Loading page...');
    await page.goto(product.url, { 
      waitUntil: 'networkidle0',
      timeout: 45000 
    });
    
    // Wait for images to load
    await page.waitForTimeout(3000);
    
    // Try multiple selectors for the main product image
    const imageUrl = await page.evaluate(() => {
      const selectors = [
        'img[data-testid="hero-image-carousel"]',
        'div[data-testid="vertical-carousel"] img',
        'img[class*="prod"][class*="image"]',
        'img[src*="i5.walmartimages.com/asr"]',
        'img[src*="i5.walmartimages.com/seo"]',
        'button[aria-label*="image"] img'
      ];
      
      for (const selector of selectors) {
        const img = document.querySelector(selector);
        if (img && img.src && img.src.includes('walmartimages.com')) {
          let src = img.src;
          // Remove size restrictions to get full quality
          src = src.replace(/\?.*$/, '');
          // Check if it's a reasonable size (not a thumbnail)
          if (img.naturalWidth >= 400) {
            return src;
          }
        }
      }
      
      // Fallback: find largest image from Walmart CDN
      const allImages = Array.from(document.querySelectorAll('img[src*="walmartimages.com"]'));
      const validImages = allImages
        .filter(img => img.naturalWidth >= 400 && img.naturalHeight >= 400)
        .sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
      
      if (validImages.length > 0) {
        let src = validImages[0].src;
        src = src.replace(/\?.*$/, '');
        return src;
      }
      
      return null;
    });
    
    if (!imageUrl) {
      console.log('❌ Could not find product image');
      await page.close();
      return false;
    }
    
    console.log(`Found image: ${imageUrl.substring(0, 80)}...`);
    
    const filepath = path.join(outputDir, product.filename);
    const size = await downloadImage(imageUrl, filepath);
    
    if (size < 50000) {
      console.log(`⚠️  Downloaded ${product.filename} but file is small (${(size/1024).toFixed(1)}KB) - might be thumbnail`);
    } else {
      console.log(`✅ Downloaded ${product.filename} (${(size/1024).toFixed(1)}KB)`);
    }
    
    await page.close();
    return true;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    await page.close();
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Walmart Product Image Downloader (Puppeteer)            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  
  let successCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const success = await downloadProductImage(browser, products[i], i + 1);
    if (success) successCount++;
    
    // Delay between requests to be polite
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  await browser.close();
  
  console.log('\n' + '═'.repeat(64));
  console.log(`✅ Successfully downloaded ${successCount}/8 images`);
  console.log('═'.repeat(64));
  
  if (successCount === 8) {
    console.log('\n🎉 All product images downloaded successfully!');
    console.log('Images saved to: ' + outputDir);
  } else {
    console.log('\n⚠️  Some images failed to download.');
    console.log('You may need to download them manually.');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
