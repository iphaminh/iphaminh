// scripts/optimize-images.js
// One-time (re-runnable) image optimizer for the public/assets library.
//
// The foto galleries were serving original camera JPGs (up to 7.8MB each;
// ~256MB across the site) straight into <img> grids — a Core Web Vitals
// problem Google measures. This converts every JPG/PNG over the size floor
// to a resized WebP (max 1800px wide, quality 80 — visually lossless for
// web display), deletes the original, and rewrites every reference in src/.
//
// Small files (logos, icons, social glyphs) are left untouched, as are the
// award badges (already webp) and video files. Originals stay in git history.
//
// Usage: node scripts/optimize-images.js        (requires: npm i --no-save sharp)

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');
const SRC = path.join(ROOT, 'src');
const SIZE_FLOOR = 200 * 1024; // leave small UI images alone
const MAX_WIDTH = 1800;
const QUALITY = 80;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push({ p, size: st.size });
  }
  return out;
}

function findSrcFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) findSrcFiles(p, out);
    else if (/\.(js|css|json)$/.test(name)) out.push(p);
  }
  return out;
}

(async () => {
  const candidates = walk(ASSETS).filter(
    f => /\.(jpe?g|png)$/i.test(f.p) && f.size >= SIZE_FLOOR
  );

  let before = 0, after = 0;
  const renames = [];

  for (const f of candidates) {
    before += f.size;
    const out = f.p.replace(/\.(jpe?g|png)$/i, '.webp');
    try {
      await sharp(f.p)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      const newSize = fs.statSync(out).size;
      // Keep the original if webp somehow came out bigger (rare, tiny PNGs)
      if (newSize >= f.size) {
        fs.unlinkSync(out);
        after += f.size;
        continue;
      }
      fs.unlinkSync(f.p);
      after += newSize;
      renames.push({
        from: path.basename(f.p),
        to: path.basename(out),
      });
    } catch (e) {
      console.error(`  ✗ ${path.relative(ROOT, f.p)}: ${e.message}`);
      after += f.size;
    }
  }

  // Rewrite references across src/ (filename with old extension → .webp)
  const srcFiles = findSrcFiles(SRC);
  let refCount = 0;
  for (const sf of srcFiles) {
    let content = fs.readFileSync(sf, 'utf8');
    let changed = false;
    for (const r of renames) {
      if (content.includes(r.from)) {
        content = content.split(r.from).join(r.to);
        changed = true;
        refCount++;
      }
    }
    if (changed) fs.writeFileSync(sf, content);
  }

  const mb = n => (n / 1024 / 1024).toFixed(1);
  console.log(`\nConverted ${renames.length}/${candidates.length} images`);
  console.log(`Size: ${mb(before)}MB → ${mb(after)}MB (saved ${mb(before - after)}MB)`);
  console.log(`Rewrote ${refCount} references across src/`);
})();
