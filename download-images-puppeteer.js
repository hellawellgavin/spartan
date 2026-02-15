const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

const products = [
    {
        id: 1,
        url: "https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134",
        name: "Nirvana Smiley Striped Graphic Tee",
        price: "$16.98"
    },
    {
        id: 2,
        url: "https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438",
        name: "South Park Cartman Graphic Tee",
        price: "$19.99"
    },
    {
        id: 3,
        url: "https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676",
        name: "SpongeBob SquarePants Character Group Graphic Tee",
        price: "$12.98"
    },
    {
        id: 4,
        url: "https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774",
        name: "Netflix Stranger Things Logo Graphic Tee",
        price: "$12.98"
    },
    {
        id: 5,
        url: "https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283",
        name: "Nintendo 8-Bit Icons Graphic T-Shirt",
        price: "$12.99"
    },
    {
        id: 6,
        url: "https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000",
        name: "Rick & Morty Embroidered Graphic Tee",
        price: "$12.98"
    },
    {
        id: 7,
        url: "https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266",
        name: "Star Wars Most Impressive Graphic Tee",
        price: "$12.99"
    },
    {
        id: 8,
        url: "https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123",
        name: "Superman Shield Logo Graphic Tee",
        price: "$9.98"
    }
];

const outputDir = '/home/gavin/spartan/src/public/assets/products/shirts';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function processProduct(browser, product) {
    console.log(`\n[${product.id}/8] Processing: ${product.name}`);
    console.log(`URL: ${product.url}`);
    
    const page = await browser.newPage();
    
    try {
        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to product page
        console.log('Loading page...');
        await page.goto(product.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for main product image to load
        await page.waitForSelector('img[data-testid="hero-image-carousel"], img[class*="hero"], img[src*="walmartimages"]', {
            timeout: 10000
        });
        
        // Extract the main product image URL
        const imageUrl = await page.evaluate(() => {
            // Try multiple selectors for the main product image
            const selectors = [
                'img[data-testid="hero-image-carousel"]',
                'img[class*="hero"]',
                'div[class*="Hero"] img',
                'img[src*="i5.walmartimages.com/asr"]',
                'img[src*="i5.walmartimages.com/seo"]'
            ];
            
            for (const selector of selectors) {
                const img = document.querySelector(selector);
                if (img && img.src && img.src.includes('walmartimages.com')) {
                    // Get the highest quality version
                    let src = img.src;
                    // Remove size parameters to get full image
                    src = src.replace(/\?.*$/, '');
                    return src;
                }
            }
            
            // Fallback: find any large image from Walmart CDN
            const allImages = document.querySelectorAll('img[src*="walmartimages.com"]');
            for (const img of allImages) {
                if (img.naturalWidth > 300 && img.naturalHeight > 300) {
                    let src = img.src;
                    src = src.replace(/\?.*$/, '');
                    return src;
                }
            }
            
            return null;
        });
        
        if (imageUrl) {
            console.log(`Found image: ${imageUrl.substring(0, 80)}...`);
            
            const filepath = path.join(outputDir, `shirt-${product.id}.jpg`);
            await downloadImage(imageUrl, filepath);
            
            const stats = fs.statSync(filepath);
            console.log(`✓ Downloaded: shirt-${product.id}.jpg (${(stats.size / 1024).toFixed(2)} KB)`);
            
            await page.close();
            
            return {
                id: product.id,
                title: product.name,
                price: product.price,
                productUrl: product.url,
                imageFile: `shirt-${product.id}.jpg`,
                imageUrl: imageUrl,
                success: true
            };
        } else {
            console.log(`✗ Could not find product image`);
            await page.close();
            return { ...product, success: false };
        }
        
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
        await page.close();
        return { ...product, success: false, error: error.message };
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('Walmart Product Image Downloader (Puppeteer)');
    console.log('='.repeat(60));
    
    console.log('\nLaunching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = [];
    
    for (const product of products) {
        const result = await processProduct(browser, product);
        results.push(result);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await browser.close();
    
    const successful = results.filter(r => r.success).length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${successful}/8 images downloaded successfully`);
    console.log('='.repeat(60));
    
    if (successful > 0) {
        console.log('\n✓ Successfully downloaded:');
        results.filter(r => r.success).forEach(r => {
            console.log(`  - ${r.imageFile}: ${r.title}`);
        });
    }
    
    if (successful < 8) {
        console.log('\n✗ Failed downloads:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`  - shirt-${r.id}.jpg: ${r.name || r.title}`);
        });
        console.log('\nNote: Some products may be out of stock or require manual download.');
    }
    
    // Save complete product data
    const jsonPath = path.join(outputDir, 'shirts-data.json');
    const successfulProducts = results.filter(r => r.success).map(r => ({
        id: r.id,
        title: r.title,
        price: r.price,
        productUrl: r.productUrl,
        imageFile: r.imageFile,
        imageUrl: r.imageUrl
    }));
    
    fs.writeFileSync(jsonPath, JSON.stringify(successfulProducts, null, 2));
    console.log(`\n✓ Product data saved to: ${jsonPath}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('Done!');
    console.log('='.repeat(60));
}

main().catch(console.error);
