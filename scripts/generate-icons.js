const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const logoPath = path.join(__dirname, '../public/logo.png');

// Generate icon from logo.png
async function generateIcon(size) {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  await sharp(logoPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 250, g: 245, b: 255, alpha: 1 } // #faf5ff background
    })
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function generateAllIcons() {
  // Check if logo.png exists
  if (!fs.existsSync(logoPath)) {
    console.error(`Error: logo.png not found at ${logoPath}`);
    process.exit(1);
  }

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Generating icons from logo.png...');
  
  // Generate all icon sizes
  for (const size of sizes) {
    await generateIcon(size);
  }
  
  // Generate apple-touch-icon (180x180)
  await sharp(logoPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 250, g: 245, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');
  
  // Generate favicon (32x32)
  await sharp(logoPath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 250, g: 245, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  console.log('Generated: favicon.png');
  
  console.log('✅ All icons generated successfully!');
}

generateAllIcons().catch(console.error);
