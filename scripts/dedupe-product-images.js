#!/usr/bin/env node
/**
 * Dedupes each product's images[] array by SHA-256 hash.
 * Keeps the first occurrence; updates `image` to images[0].
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PRODUCTS = path.join(ROOT, 'data', 'products.json');

const data = JSON.parse(fs.readFileSync(PRODUCTS, 'utf8'));

function hash(p) {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

let totalBefore = 0;
let totalAfter = 0;
const dropped = [];

for (const p of data.products) {
  const before = (p.images || []).length;
  totalBefore += before;
  const seen = new Set();
  const kept = [];
  for (const img of p.images || []) {
    const h = hash(img);
    if (!h) {
      // file missing — skip but log
      dropped.push(`${p.id}: MISSING ${img}`);
      continue;
    }
    if (seen.has(h)) {
      dropped.push(`${p.id}: dup ${img}`);
      continue;
    }
    seen.add(h);
    kept.push(img);
  }
  p.images = kept;
  // Keep singular `image` pointing at first (used as the card primary)
  if (kept.length) p.image = kept[0];
  totalAfter += kept.length;
}

fs.writeFileSync(PRODUCTS, JSON.stringify(data, null, 4) + '\n');
console.log(`Image refs: ${totalBefore} -> ${totalAfter} (removed ${totalBefore - totalAfter})`);
console.log(`Products: ${data.products.length}`);
console.log(`Avg images/product: ${(totalAfter / data.products.length).toFixed(2)}`);
const counts = data.products.map(p => p.images.length);
const dist = counts.reduce((a, n) => (a[n] = (a[n] || 0) + 1, a), {});
console.log(`Distribution: ${JSON.stringify(dist)}`);
if (dropped.length) {
  console.log(`\nDropped:`);
  dropped.forEach(d => console.log(`  ${d}`));
}
