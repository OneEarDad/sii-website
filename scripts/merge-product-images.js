#!/usr/bin/env node
/**
 * Merges scraped image paths from data/product-image-map.json
 * into data/products.json by adding an `images: []` array per product.
 * The existing `image` is preserved as the first item (primary card image).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS = path.join(ROOT, 'data', 'products.json');
const MAP = path.join(ROOT, 'data', 'product-image-map.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS, 'utf8'));
const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));

let merged = 0;
let missing = [];

for (const p of products.products) {
  const entry = map[p.id];
  const scraped = (entry && Array.isArray(entry.images)) ? entry.images : [];
  const seen = new Set();
  const list = [];
  // Original card image first (so existing layout stays consistent)
  if (p.image && !seen.has(p.image)) {
    list.push(p.image);
    seen.add(p.image);
  }
  // Then scraped gallery images
  for (const img of scraped) {
    if (!seen.has(img)) {
      list.push(img);
      seen.add(img);
    }
  }
  p.images = list;
  if (list.length <= 1) missing.push(p.id);
  if (scraped.length) merged++;
}

fs.writeFileSync(PRODUCTS, JSON.stringify(products, null, 4) + '\n');
console.log(`Merged ${merged} products with scraped images.`);
console.log(`Total products: ${products.products.length}`);
console.log(`Products with only 1 image: ${missing.length}`);
if (missing.length) console.log(`  ${missing.join(', ')}`);
