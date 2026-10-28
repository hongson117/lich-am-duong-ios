import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root = process.cwd();
const progress = JSON.parse((await fs.readFile(process.argv[2], 'utf8')).replace(/^\uFEFF/, ''));
const titles = JSON.parse(await fs.readFile('src/data/tao-chapters-editorial.json', 'utf8'));
const all = [
  { id: 'day-01', title: 'Miền quê bình yên', path: path.join(root, 'assets/vietnam-sunrise.png'), prompt: 'Original approved Vietnamese countryside illustration.' },
  ...progress.generatedDaily,
  ...progress.generatedTao,
];
const manifest = [];
for (const art of all) {
  if (!art.path) throw new Error('Missing source path for ' + art.id);
  const kind = art.chapter ? 'tao' : 'village';
  const id = art.chapter ? art.id : art.id.replace('day-', 'village-');
  const relative = 'assets/' + kind + '/' + id + '.jpg';
  const destination = path.join(root, relative);
  const original = path.join(root, 'art-originals', kind, id + '.png');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.mkdir(path.dirname(original), { recursive: true });
  try { await fs.access(original); } catch { await fs.copyFile(art.path, original); }
  try { await fs.access(destination); } catch {
    await sharp(art.path).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toFile(destination);
  }
  const thumbnail = relative.replace('.jpg', '.thumb.jpg');
  const thumbPath = path.join(root, thumbnail);
  try { await fs.access(thumbPath); } catch { await sharp(destination).resize({ width: 280, height: 280, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(thumbPath); }
  const meta = await sharp(destination).metadata();
  const data = await fs.readFile(destination);
  manifest.push({ id, kind, chapter: art.chapter ?? null, title: art.chapter ? titles[art.chapter - 1].title : art.title, image: relative, thumbnail, width: meta.width, height: meta.height, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), prompt: art.prompt });
}
manifest.sort((a, b) => a.id.localeCompare(b.id));
await fs.writeFile('docs/ARTWORK-MANIFEST.json', JSON.stringify({ tool: 'built-in image_gen', compression: 'JPEG quality 88; no cropping or creative edits', images: manifest }, null, 2));
console.log(JSON.stringify({ village: manifest.filter(x => x.kind === 'village').length, tao: manifest.filter(x => x.kind === 'tao').length, totalBytes: manifest.reduce((s, x) => s + x.bytes, 0) }));
