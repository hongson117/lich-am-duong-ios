import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const manifest = JSON.parse(await fs.readFile('docs/ARTWORK-MANIFEST.json', 'utf8'));
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
let bytes = 0;
for (const [kind, count, maxEdge] of [['tao', 81, 800], ['village', 31, 768]]) {
  const entries = manifest.images.filter(x => x.kind === kind);
  if (entries.length !== count || new Set(entries.map(x => x.sha256)).size !== count) throw new Error('Wrong count or duplicate images: ' + kind);
  for (let i = 1; i <= count; i++) {
    const id = kind + '-' + String(i).padStart(2, '0'), art = entries.find(x => x.id === id);
    if (!art) throw new Error('Missing ' + id);
    const data = await fs.readFile(art.image), meta = await sharp(data).metadata();
    if (digest(data) !== art.sha256 || meta.format !== 'webp' || Math.max(meta.width, meta.height) > maxEdge) throw new Error('Invalid optimized image: ' + id);
    bytes += data.length;
    if (kind === 'tao') {
      const thumb = await fs.readFile(art.thumbnail), tm = await sharp(thumb).metadata();
      if (digest(thumb) !== art.thumbnailSHA256 || tm.format !== 'webp' || tm.width > 160 || tm.height > 160) throw new Error('Invalid thumbnail: ' + id);
      bytes += thumb.length;
    } else if (art.thumbnail) throw new Error('Unused village thumbnail must not be shipped: ' + id);
  }
}
if (bytes > 14_000_000) throw new Error('Artwork exceeds the 14 MB size budget: ' + bytes);
const logo = await fs.readFile(manifest.runtimeLogo.image);
if (digest(logo) !== manifest.runtimeLogo.sha256 || (await sharp(logo).metadata()).format !== 'webp') throw new Error('Invalid runtime logo');
for (const native of manifest.nativeImages) {
  const data = await fs.readFile(native.image);
  if (digest(data) !== native.sha256) throw new Error('Invalid native image ' + native.image);
}
console.log('Verified 112 unique WebP illustrations, 81 small thumbnails, optimized logo/native PNG; artwork bytes: ' + bytes);
