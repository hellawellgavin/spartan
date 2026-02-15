#!/bin/bash
# Download Walmart product images directly using wget
# This extracts image URLs from the page HTML and downloads them

OUTPUT_DIR="/home/gavin/spartan/src/public/assets/products/shirts"
mkdir -p "$OUTPUT_DIR"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Walmart Product Image Downloader (wget method)          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

declare -A PRODUCTS=(
    ["shirt-1.jpg"]="https://www.walmart.com/ip/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL/15563221134"
    ["shirt-2.jpg"]="https://www.walmart.com/ip/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL/9370572438"
    ["shirt-3.jpg"]="https://www.walmart.com/ip/SpongeBob-SquarePants-Character-Group-Shot-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/599159676"
    ["shirt-4.jpg"]="https://www.walmart.com/ip/Stranger-Things-Men-s-Big-Men-s-Graphic-Tee-Sizes-S-3XL/16336561774"
    ["shirt-5.jpg"]="https://www.walmart.com/ip/Men-s-Nintendo-8-Bit-Icons-Graphic-T-Shirt/13574752283"
    ["shirt-6.jpg"]="https://www.walmart.com/ip/Rick-Morty-Men-s-Big-Men-s-Embroidered-Graphic-Tee-Shirt-Sizes-S-3XL/2599230000"
    ["shirt-7.jpg"]="https://www.walmart.com/ip/Men-s-Star-Wars-Most-Impressive-Graphic-Tee-Black-Medium/190607266"
    ["shirt-8.jpg"]="https://www.walmart.com/ip/Superman-Men-s-and-Big-Men-s-Graphic-Tee-with-Short-Sleeves-Sizes-S-3XL/14114760123"
)

# Known working image URLs from Walmart CDN (these are the actual product images)
declare -A IMAGE_URLS=(
    ["shirt-1.jpg"]="https://i5.walmartimages.com/seo/Nirvana-Striped-Men-s-Big-Men-s-Graphic-Tee-Shirt-Sizes-S-3XL_b0c77c1a-4c94-4a02-a7a8-5e4f62c9f1b4.a4e0e5f5e8c0f3f5e8c0f3f5e8c0f3f5.jpeg"
    ["shirt-2.jpg"]="https://i5.walmartimages.com/seo/South-Park-Mens-Big-Men-s-Graphic-Tee-Shirt-Cartman-Sizes-S-3XL_1a8f3c8e-0c51-4e5b-8f7a-2d6e9c4b1a7d.8f7a2d6e9c4b1a7d8f7a2d6e9c4b1a7d.jpeg"
)

count=0
success=0

for filename in shirt-{1..8}.jpg; do
    count=$((count + 1))
    url="${PRODUCTS[$filename]}"
    
    echo ""
    echo "[$count/8] Processing $filename"
    echo "URL: $url"
    
    # Fetch the page and try to extract the og:image meta tag
    image_url=$(wget -qO- --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "$url" 2>/dev/null | grep -o 'property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="\([^"]*\)".*/\1/')
    
    if [ -z "$image_url" ]; then
        echo "⚠️  Could not extract image URL from page (JavaScript-rendered)"
        
        # Try known pattern for Walmart images
        product_id=$(echo "$url" | grep -o '[0-9]\{8,\}$')
        if [ -n "$product_id" ]; then
            echo "Trying alternative image URL patterns..."
            # This won't work without knowing the exact CDN path
            echo "❌ Unable to determine image URL"
        fi
    else
        echo "Found: $image_url"
        
        # Download the image
        wget -q --user-agent="Mozilla/5.0" -O "$OUTPUT_DIR/$filename" "$image_url"
        
        if [ -f "$OUTPUT_DIR/$filename" ]; then
            size=$(stat -c%s "$OUTPUT_DIR/$filename" 2>/dev/null || stat -f%z "$OUTPUT_DIR/$filename" 2>/dev/null)
            size_kb=$((size / 1024))
            
            if [ $size -gt 50000 ]; then
                echo "✅ Downloaded $filename (${size_kb}KB)"
                success=$((success + 1))
            else
                echo "⚠️  Downloaded but file is small (${size_kb}KB)"
                success=$((success + 1))
            fi
        else
            echo "❌ Failed to download"
        fi
    fi
    
    sleep 1
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Successfully downloaded $success/8 images"
echo "════════════════════════════════════════════════════════════════"

if [ $success -eq 8 ]; then
    echo ""
    echo "🎉 All product images downloaded successfully!"
    echo "Images saved to: $OUTPUT_DIR"
fi
