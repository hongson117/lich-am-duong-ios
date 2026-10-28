import fs from 'node:fs/promises';
import path from 'node:path';
import { optimizeArtwork } from './optimize-artwork.mjs';
const progress = JSON.parse((await fs.readFile(process.argv[2], 'utf8')).replace(/^\uFEFF/, ''));
const titles = JSON.parse(await fs.readFile('src/data/tao-chapters-editorial.json', 'utf8'));
const all = [{ id: 'day-01', title: 'Miền quê bình yên', path: path.resolve('assets/vietnam-sunrise.png'), prompt: 'Original approved Vietnamese countryside illustration.' }, ...progress.generatedDaily, ...progress.generatedTao];
const entries = [];
for (const art of all) {
  const kind = art.chapter ? 'tao' : 'village', id = art.chapter ? art.id : art.id.replace('day-', 'village-');
  const original = path.join('art-originals', kind, id + '.png');
  await fs.mkdir(path.dirname(original), { recursive: true });
  try { await fs.access(original); } catch { if (!art.path) throw new Error('Missing source for ' + id); await fs.copyFile(art.path, original); }
  entries.push({ id, kind, chapter: art.chapter ?? null, title: art.chapter ? titles[art.chapter - 1].title : art.title, prompt: art.prompt });
}
await optimizeArtwork(entries);
