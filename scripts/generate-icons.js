const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create a simple icon using sharp
async function generateIcon(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#7c3aed"/>
        <stop offset="100%" style="stop-color:#db2777"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="80" fill="url(#bg)"/>
    <g transform="translate(256,256)">
      <!-- Crown -->
      <path d="M-80,-60 L-60,-100 L-30,-70 L0,-110 L30,-70 L60,-100 L80,-60 L80,-20 L-80,-20 Z" fill="#fbbf24"/>
      <!-- Globe outline -->
      <circle cx="0" cy="60" r="85" fill="none" stroke="white" stroke-width="10"/>
      <ellipse cx="0" cy="60" rx="85" ry="32" fill="none" stroke="white" stroke-width="6"/>
      <line x1="0" y1="-25" x2="0" y2="145" stroke="white" stroke-width="6"/>
    </g>
  </svg>`;

  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function generateAllIcons() {
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    await generateIcon(size);
  }
  
  // Also generate apple-touch-icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#7c3aed"/>
        <stop offset="100%" style="stop-color:#db2777"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="80" fill="url(#bg)"/>
    <g transform="translate(256,256)">
      <!-- Crown -->
      <path d="M-80,-60 L-60,-100 L-30,-70 L0,-110 L30,-70 L60,-100 L80,-60 L80,-20 L-80,-20 Z" fill="#fbbf24"/>
      <!-- Globe outline -->
      <circle cx="0" cy="60" r="85" fill="none" stroke="white" stroke-width="10"/>
      <ellipse cx="0" cy="60" rx="85" ry="32" fill="none" stroke="white" stroke-width="6"/>
      <line x1="0" y1="-25" x2="0" y2="145" stroke="white" stroke-width="6"/>
    </g>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');
  
  // Generate favicon
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  console.log('Generated: favicon.png');
}

generateAllIcons().catch(console.error);
