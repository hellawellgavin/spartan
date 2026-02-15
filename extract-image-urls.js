const https = require('https');

const products = [
  { id: 1, url: "https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134" },
  { id: 2, url: "https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438" },
  { id: 3, url: "https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676" },
  { id: 4, url: "https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774" },
  { id: 5, url: "https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283" },
  { id: 6, url: "https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000" },
  { id: 7, url: "https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266" },
  { id: 8, url: "https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123" }
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractImageUrls(html) {
  const imageUrls = [];
  
  // Pattern 1: Look for og:image meta tag
  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (ogImageMatch) {
    imageUrls.push({ source: 'og:image', url: ogImageMatch[1] });
  }
  
  // Pattern 2: Look for JSON-LD structured data
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">({.*?})<\/script>/gs);
  if (jsonLdMatches) {
    jsonLdMatches.forEach(match => {
      try {
        const jsonStr = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        const data = JSON.parse(jsonStr);
        if (data.image) {
          imageUrls.push({ source: 'json-ld', url: data.image });
        }
      } catch (e) {}
    });
  }
  
  // Pattern 3: Look for images in inline JavaScript/JSON
  const imagePatterns = [
    /"imageUrl":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/g,
    /"largeImage":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/g,
    /"heroImage":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/g,
    /"image":"(https:\/\/i5\.walmartimages\.com\/[^"]+)"/g
  ];
  
  imagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
      imageUrls.push({ source: 'inline-json', url });
    }
  });
  
  // Return the first high-quality image found
  for (const img of imageUrls) {
    const url = img.url;
    // Prefer larger images (look for dimensions in URL or just take first walmartimages.com URL)
    if (url.includes('i5.walmartimages.com')) {
      return url.replace(/\?.*$/, ''); // Remove query params
    }
  }
  
  return null;
}

async function main() {
  console.log('Extracting Walmart product image URLs...\n');
  
  const results = [];
  
  for (const product of products) {
    console.log(`[${product.id}/8] Fetching: ${product.url}`);
    
    try {
      const html = await fetchPage(product.url);
      const imageUrl = extractImageUrls(html);
      
      if (imageUrl) {
        console.log(`✓ Found image: ${imageUrl.substring(0, 80)}...`);
        results.push({
          productNumber: product.id,
          filename: `shirt-${product.id}.jpg`,
          imageUrl: imageUrl,
          productUrl: product.url,
          type: 'main-hero-image'
        });
      } else {
        console.log(`✗ No image URL found`);
        results.push({
          productNumber: product.id,
          filename: `shirt-${product.id}.jpg`,
          imageUrl: null,
          productUrl: product.url,
          error: 'Image URL not found in HTML'
        });
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      results.push({
        productNumber: product.id,
        filename: `shirt-${product.id}.jpg`,
        imageUrl: null,
        productUrl: product.url,
        error: error.message
      });
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('RESULTS (JSON)');
  console.log('='.repeat(70));
  console.log(JSON.stringify(results, null, 2));
  
  const successful = results.filter(r => r.imageUrl).length;
  console.log(`\n✓ Successfully extracted ${successful}/8 image URLs`);
  
  if (successful > 0) {
    console.log('\nYou can now update shirts.json with these CDN URLs.');
  }
}

main().catch(console.error);
