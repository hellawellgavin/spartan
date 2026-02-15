const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const products = [
    {
        id: 1,
        url: "https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134",
        name: "Nirvana Smiley Striped Graphic Tee"
    },
    {
        id: 2,
        url: "https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438",
        name: "South Park Cartman Graphic Tee"
    },
    {
        id: 3,
        url: "https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676",
        name: "SpongeBob SquarePants Character Group Graphic Tee"
    },
    {
        id: 4,
        url: "https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774",
        name: "Netflix Stranger Things Logo Graphic Tee"
    },
    {
        id: 5,
        url: "https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283",
        name: "Nintendo 8-Bit Icons Graphic T-Shirt"
    },
    {
        id: 6,
        url: "https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000",
        name: "Rick & Morty Embroidered Graphic Tee"
    },
    {
        id: 7,
        url: "https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266",
        name: "Star Wars Most Impressive Graphic Tee"
    },
    {
        id: 8,
        url: "https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123",
        name: "Superman Shield Logo Graphic Tee"
    }
];

const outputDir = '/home/gavin/spartan/src/public/assets/products/shirts';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
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

function extractImageUrl(html) {
    // Try various patterns to find the image URL
    const patterns = [
        /<meta property="og:image" content="([^"]+)"/,
        /"imageUrl":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/,
        /"largeImage":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/,
        /"heroImage":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/,
        /<img[^>]+src="(https:\/\/i5\.walmartimages\.com\/asr\/[^"]+)"/
    ];
    
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
            // Clean up the URL
            let imageUrl = match[1];
            imageUrl = imageUrl.replace(/\\u002F/g, '/');
            imageUrl = imageUrl.replace(/\\/g, '');
            // Remove size parameters to get full image
            imageUrl = imageUrl.replace(/\?.*$/, '');
            return imageUrl;
        }
    }
    
    return null;
}

async function processProduct(product) {
    console.log(`\n[${product.id}/8] Processing: ${product.name}`);
    console.log(`URL: ${product.url}`);
    
    try {
        const html = await fetchPage(product.url);
        const imageUrl = extractImageUrl(html);
        
        if (imageUrl) {
            console.log(`Found image: ${imageUrl.substring(0, 80)}...`);
            
            const filepath = path.join(outputDir, `shirt-${product.id}.jpg`);
            await downloadImage(imageUrl, filepath);
            
            const stats = fs.statSync(filepath);
            console.log(`✓ Downloaded: shirt-${product.id}.jpg (${(stats.size / 1024).toFixed(2)} KB)`);
            
            return {
                ...product,
                imageFile: `shirt-${product.id}.jpg`,
                imageUrl: imageUrl,
                success: true
            };
        } else {
            console.log(`✗ Could not extract image URL`);
            return { ...product, success: false };
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
        return { ...product, success: false, error: error.message };
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('Walmart Product Image Downloader');
    console.log('='.repeat(60));
    
    const results = [];
    
    for (const product of products) {
        const result = await processProduct(product);
        results.push(result);
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successful = results.filter(r => r.success).length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${successful}/8 images downloaded successfully`);
    console.log('='.repeat(60));
    
    if (successful > 0) {
        console.log('\n✓ Successfully downloaded:');
        results.filter(r => r.success).forEach(r => {
            console.log(`  - ${r.imageFile}: ${r.name}`);
        });
    }
    
    if (successful < 8) {
        console.log('\n✗ Failed downloads:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`  - shirt-${r.id}.jpg: ${r.name}`);
        });
    }
    
    // Save results to JSON
    const jsonPath = path.join(outputDir, 'download-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`\n✓ Results saved to: ${jsonPath}`);
}

main().catch(console.error);
