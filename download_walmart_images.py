#!/usr/bin/env python3
"""
Script to download Walmart product images
"""
import requests
import json
import re
from pathlib import Path

# Product URLs to scrape
products = [
    {
        "url": "https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134",
        "name": "Nirvana Smiley Striped Graphic Tee"
    },
    {
        "url": "https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438",
        "name": "South Park Cartman Graphic Tee"
    },
    {
        "url": "https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676",
        "name": "SpongeBob SquarePants Character Group Graphic Tee"
    },
    {
        "url": "https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774",
        "name": "Netflix Stranger Things Logo Graphic Tee"
    },
    {
        "url": "https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283",
        "name": "Nintendo 8-Bit Icons Graphic T-Shirt"
    },
    {
        "url": "https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000",
        "name": "Rick & Morty Embroidered Graphic Tee"
    },
    {
        "url": "https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266",
        "name": "Star Wars Most Impressive Graphic Tee"
    },
    {
        "url": "https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123",
        "name": "Superman Shield Logo Graphic Tee"
    }
]

def download_image(url, filepath):
    """Download an image from a URL and save it to filepath"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"✓ Downloaded: {filepath.name}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {filepath.name}: {e}")
        return False

def get_product_data(url):
    """Fetch product page and extract image URL and price"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        html = response.text
        
        # Try to find JSON-LD structured data
        json_ld_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
        if json_ld_match:
            try:
                data = json.loads(json_ld_match.group(1))
                if isinstance(data, dict):
                    image = data.get('image', '')
                    offers = data.get('offers', {})
                    price = offers.get('price', '') if isinstance(offers, dict) else ''
                    if image:
                        return {'image': image, 'price': price}
            except:
                pass
        
        # Try to find image in meta tags
        og_image_match = re.search(r'<meta property="og:image" content="([^"]+)"', html)
        if og_image_match:
            image_url = og_image_match.group(1)
            # Try to find price
            price_match = re.search(r'"price":"([^"]+)"', html)
            price = price_match.group(1) if price_match else ''
            return {'image': image_url, 'price': price}
        
        # Try to find image in various patterns
        image_patterns = [
            r'"imageUrl":"(https://i5\.walmartimages\.com/[^"]+)"',
            r'"largeImage":"(https://i5\.walmartimages\.com/[^"]+)"',
            r'"image":"(https://i5\.walmartimages\.com/[^"]+)"',
        ]
        
        for pattern in image_patterns:
            match = re.search(pattern, html)
            if match:
                image_url = match.group(1)
                price_match = re.search(r'"price":"([^"]+)"', html)
                price = price_match.group(1) if price_match else ''
                return {'image': image_url, 'price': price}
        
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    output_dir = Path("/home/gavin/spartan/src/public/assets/products/shirts")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("Downloading Walmart product images...\n")
    
    results = []
    
    for idx, product in enumerate(products, 1):
        print(f"\n[{idx}/8] Processing: {product['name']}")
        print(f"URL: {product['url']}")
        
        data = get_product_data(product['url'])
        
        if data and data.get('image'):
            image_url = data['image']
            # Clean up image URL (remove size parameters if any)
            image_url = re.sub(r'\?.*$', '', image_url)
            
            filepath = output_dir / f"shirt-{idx}.jpg"
            success = download_image(image_url, filepath)
            
            if success:
                results.append({
                    'id': idx,
                    'name': product['name'],
                    'url': product['url'],
                    'price': data.get('price', 'N/A'),
                    'image': f"shirt-{idx}.jpg",
                    'image_url': image_url
                })
        else:
            print(f"✗ Could not extract image URL for {product['name']}")
    
    print(f"\n{'='*60}")
    print(f"Downloaded {len(results)}/8 images successfully")
    print(f"{'='*60}\n")
    
    # Print summary
    if results:
        print("\nProduct Summary:")
        print("-" * 60)
        for item in results:
            print(f"\n{item['id']}. {item['name']}")
            print(f"   Price: ${item['price']}" if item['price'] != 'N/A' else "   Price: N/A")
            print(f"   URL: {item['url']}")
            print(f"   Image: {item['image']}")
    
    # Save results to JSON
    json_path = output_dir / "products.json"
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✓ Saved product data to: {json_path}")

if __name__ == "__main__":
    main()
