#!/usr/bin/env node
/**
 * Hashes every image referenced by products.json and reports byte-identical
 * duplicates within a product (and globally).
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

let dupCount = 0;
const globalHashes = new Map(); // hash -> [paths]

for (const p of data.products) {
  const list = Array.isArray(p.images) ? p.images : [];
  const seen = new Map(); // hash -> path
  const dupes = [];
  for (const img of list) {
    const h = hash(img);
    if (!h) {
      console.log(`  MISSING FILE: ${p.id} ${img}`);
      continue;
    }
    if (seen.has(h)) {
      dupes.push({ duplicate: img, originalOf: seen.get(h) });
    } else {
      seen.set(h, img);
    }
    if (!globalHashes.has(h)) globalHashes.set(h, []);
    globalHashes.get(h).push(`${p.id}:${img}`);
  }
  if (dupes.length) {
    dupCount += dupes.length;
    console.log(`\n${p.id} (${p.name}) — ${list.length} images, ${dupes.length} duplicate(s):`);
    dupes.forEach(d => console.log(`  DUP: ${d.duplicate}\n   = ${d.originalOf}`));
  }
}

console.log(`\n=== Total duplicates within products: ${dupCount} ===`);
console.log(`Total products: ${data.products.length}`);
console.log(`Total image refs: ${data.products.reduce((n, p) => n + (p.images?.length || 0), 0)}`);
console.log(`Unique image hashes: ${globalHashes.size}`);
