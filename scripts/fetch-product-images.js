#!/usr/bin/env node
/**
 * Scrapes siimedical.com product pages and downloads gallery images
 * to assets/images/products/{sku}/ — outputs a JSON map for products.json.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'images', 'products');
const MAP_OUT = path.join(ROOT, 'data', 'product-image-map.json');

// product id -> siimedical slug
const SLUGS = {
  'SS09-0627F': 'ss09-0627-f',
  'SS09-0625F': 'ss09-0625-f',
  'SS09-0837F': 'ss09-0837-f',
  'SS09-0835F': 'ss09-0835-f',
  'SS11-1021F': 'ss11-1021-f',
  'SS11-1020F': 'ss11-1020-f',
  'SS07-0282F': 'ss07-0282-f',
  'SS07-0291F': 'ss07-0291-f',
  'SS07-0284F': 'ss07-0284-f',
  'SS07-0218F': 'ss07-0218-f',
  'SS04-0110F': 'ss04-0110-f',
  'SS04-0100F': 'ss04-0100-f',
  'SS08-0539F': 'ss08-0539-f',
  'SS08-0500F': 'ss08-0500-f',
  'SS08-0537F': 'ss08-0537-f',
  'SS08-0553F': 'ss08-0553-f',
  'SS08-0548F': 'ss08-0548-f',
  'SS18-1716F': 'ss18-1716-f',
  'SS62-6401F': 'ss62-6401-f',
  'SS62-4300F': 'ss62-4300-f',
  'SS62-4349F': 'ss62-4349-f',
  'SUCTION-MAGILL': 'susol-suction-tube-magill-9fg',
  'BSDP-04F': 'bsdp-04-f',
  'BSDP-03F': 'bsdp-03-f',
  'BSDP-03-02F': 'bsdp-03-02-f',
  'SSP-132F': 'ssp-132-f',
  'SSP-024F': 'ssp-024-f',
  'SSP-021F': 'ssp-021-f',
  'S-TQS': 's-tqs',
  'S-TQM': 's-tqm',
  'S-TQL': 'su-digital-tourniquets-large-blue'
};

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function extractImages(html) {
  // Match each individual gallery item:
  //   <figure ... class="...woocommerce-product-gallery__image..."...>...<a href="full.jpg">...</figure>
  const figureRe = /<figure[^>]*class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>[\s\S]*?<\/figure>/gi;
  const figures = html.match(figureRe) || [];
  const urls = [];
  for (const fig of figures) {
    // Pull the full-image URL from the <a href> wrapping the gallery image
    const a = fig.match(/<a[^>]+href="(https:\/\/www\.siimedical\.com\/wp-content\/uploads\/[^"]+?\.(?:jpg|jpeg|png|webp))"/i);
    if (a) urls.push(a[1]);
  }
  // Dedupe; prefer canonical (no -1200x800, no -scaled) when present
  const groups = new Map();
  for (const u of urls) {
    const key = u
      .replace(/-\d+x\d+(?=\.(?:jpg|jpeg|png|webp)$)/i, '')
      .replace(/-scaled(?=\.(?:jpg|jpeg|png|webp)$)/i, '');
    const existing = groups.get(key);
    if (!existing || u === key) groups.set(key, u);
  }
  return [...groups.values()];
}

async function ensureDir(d) {
  await fs.promises.mkdir(d, { recursive: true });
}

async function downloadOne(url, dest) {
  if (fs.existsSync(dest)) return { skipped: true };
  const buf = await get(url);
  await fs.promises.writeFile(dest, buf);
  return { bytes: buf.length };
}

async function processProduct(id, slug) {
  const url = `https://www.siimedical.com/product/${slug}/`;
  let html;
  try {
    const buf = await get(url);
    html = buf.toString('utf8');
  } catch (e) {
    return { id, slug, error: e.message, images: [] };
  }
  const images = extractImages(html);
  if (!images.length) {
    return { id, slug, error: 'no images found', images: [] };
  }
  const dir = path.join(OUT_DIR, id);
  await ensureDir(dir);
  const localPaths = [];
  for (const imgUrl of images) {
    const name = path.basename(new URL(imgUrl).pathname);
    const dest = path.join(dir, name);
    try {
      await downloadOne(imgUrl, dest);
      localPaths.push(`assets/images/products/${id}/${name}`);
    } catch (e) {
      console.error(`  ! ${id}: ${imgUrl} — ${e.message}`);
    }
  }
  return { id, slug, images: localPaths };
}

async function main() {
  await ensureDir(OUT_DIR);
  const entries = Object.entries(SLUGS);
  const results = {};
  // moderate parallelism — be polite to the origin
  const CONCURRENCY = 5;
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const i = cursor++;
      const [id, slug] = entries[i];
      process.stdout.write(`[${i + 1}/${entries.length}] ${id} (${slug})... `);
      const r = await processProduct(id, slug);
      if (r.error) {
        console.log(`ERROR: ${r.error}`);
      } else {
        console.log(`${r.images.length} images`);
      }
      results[id] = r;
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await fs.promises.writeFile(MAP_OUT, JSON.stringify(results, null, 2));
  console.log(`\nMap written to ${MAP_OUT}`);
  const totalImages = Object.values(results).reduce((n, r) => n + (r.images?.length || 0), 0);
  const failed = Object.values(results).filter(r => r.error).map(r => `${r.id} (${r.slug})`);
  console.log(`Total images: ${totalImages}`);
  if (failed.length) console.log(`Failed: ${failed.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
