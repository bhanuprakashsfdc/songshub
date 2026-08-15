import fs from 'fs';
import path from 'path';

const PLACEHOLDER_DIR = path.join(process.cwd(), 'public', 'placeholders');

if (!fs.existsSync(PLACEHOLDER_DIR)) {
  fs.mkdirSync(PLACEHOLDER_DIR, { recursive: true });
}

const colors = [
  ['#1a1a2e', '#16213e', '#e94560'],
  ['#0f3460', '#16213e', '#e94560'],
  ['#533483', '#0f3460', '#e94560'],
  ['#1a1a2e', '#16213e', '#f39c12'],
  ['#2c3e50', '#34495e', '#e74c3c'],
  ['#1e3c72', '#2a5298', '#e94560'],
  ['#11998e', '#38ef7d', '#ffffff'],
  ['#fc4a1a', '#f7b733', '#ffffff'],
  ['#834d9b', '#d04ed6', '#ffffff'],
  ['#008B8B', '#20B2AA', '#ffffff'],
];

const categories = [
  { name: 'movie', label: 'MOVIE', icon: '🎬' },
  { name: 'song', label: 'SONG', icon: '🎵' },
  { name: 'action', label: 'ACTION', icon: '💥' },
  { name: 'romance', label: 'ROMANCE', icon: '❤️' },
  { name: 'comedy', label: 'COMEDY', icon: '😂' },
  { name: 'thriller', label: 'THRILLER', icon: '🔪' },
  { name: 'drama', label: 'DRAMA', icon: '🎭' },
  { name: 'music', label: 'MUSIC', icon: '🎧' },
];

function generateSVG(category, colorSet, index) {
  const [bg1, bg2, textColor] = colorSet;
  const fileName = `${category.name}-${String(index + 1).padStart(2, '0')}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bg2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad)"/>
  <text x="960" y="540" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" opacity="0.9">${category.icon} ${category.label}</text>
  <text x="960" y="660" font-family="Arial, sans-serif" font-size="60" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" opacity="0.6">${String(index + 1).padStart(2, '0')}</text>
</svg>`;
  fs.writeFileSync(path.join(PLACEHOLDER_DIR, fileName), svg.trim());
}

categories.forEach((category, catIndex) => {
  const colorSet = colors[catIndex % colors.length];
  for (let i = 0; i < 10; i++) {
    generateSVG(category, colorSet, i);
  }
});

console.log(`Generated ${categories.length * 10} placeholder images in ${PLACEHOLDER_DIR}`);
