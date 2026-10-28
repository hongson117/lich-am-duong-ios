import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

export const PROFILE = {
  tao: { width: 800, height: 800, quality: 58 },
  village: { width: 768, height: 512, quality: 56 },
  thumbnail: { width: 160, height: 160, quality: 50 },
  logo: { width: 480, height: 480, quality: 70 },
};
const root = process.cwd();
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
async function inspect(relative) {
  const data = await fs.readFile(relative), metadata = await sharp(data).metadata();
  return { width: metadata.width, height: metadata.height, bytes: data.length, sha256: digest(data), format: metadata.format };
}
async function encode(source, relative, profile) {
  await fs.mkdir(path.dirname(relative), { recursive: true });
  await sharp(source).rotate().resize({ width: profile.width, height: profile.height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: profile.quality, effort: 6, smartSubsample: true }).toFile(relative);
  return inspect(relative);
}
export async function optimizeArtwork(seed) {
  const previous = JSON.parse(await fs.readFile('docs/ARTWORK-MANIFEST.json', 'utf8'));
  const entries = seed ?? previous.images;
  const archive = 'art-originals/manifests/jpeg-v1.json';
  await fs.mkdir(path.dirname(archive), { recursive: true });
  try { await fs.access(archive); } catch { await fs.writeFile(archive, JSON.stringify(previous, null, 2)); }
  const priorResources = [...new Set(previous.images.flatMap(x => [x.image, x.thumbnail].filter(Boolean)))];
  let beforeBytes = 0;
  for (const file of priorResources) { try { beforeBytes += (await fs.stat(file)).size; } catch { /* old files can be archived after migration */ } }
  const images = [];
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const art = entries[cursor++];
      const profile = PROFILE[art.kind];
      if (!profile) throw new Error('Unknown artwork kind: ' + art.kind);
      const original = path.join(root, 'art-originals', art.kind, art.id + '.png');
      await fs.access(original);
      const image = 'assets/' + art.kind + '/' + art.id + '.webp';
      const full = await encode(original, image, profile);
      let thumbnail, thumb;
      if (art.kind === 'tao') {
        thumbnail = image.replace('.webp', '.thumb.webp');
        thumb = await encode(original, thumbnail, PROFILE.thumbnail);
      }
      images.push({ id: art.id, kind: art.kind, chapter: art.chapter ?? null, title: art.title, image, ...full,
        quality: profile.quality, ...(thumbnail ? { thumbnail, thumbnailBytes: thumb.bytes, thumbnailSHA256: thumb.sha256, thumbnailWidth: thumb.width, thumbnailHeight: thumb.height } : {}),
        prompt: art.prompt });
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  images.sort((a, b) => a.id.localeCompare(b.id));

  const logoSource = 'assets/logo-3d.png';
  const logo = await encode(logoSource, 'assets/logo-ui.webp', PROFILE.logo);
  await sharp(logoSource).resize(1024, 1024).removeAlpha().png({ palette: true, colours: 256, dither: 1, quality: 90, compressionLevel: 9, effort: 10 }).toFile('assets/app-icon.png');
  await sharp(logoSource).resize(640, 640).removeAlpha().png({ palette: true, colours: 256, dither: 1, quality: 85, compressionLevel: 9, effort: 10 }).toFile('assets/splash-logo.png');
  await sharp(logoSource).resize(64, 64).png({ palette: true, colours: 128, compressionLevel: 9 }).toFile('assets/favicon-small.png');
  const native = await Promise.all(['assets/app-icon.png', 'assets/splash-logo.png', 'assets/favicon-small.png'].map(async image => ({ image, ...await inspect(image) })));
  const totalArtworkBytes = images.reduce((sum, x) => sum + x.bytes + (x.thumbnailBytes ?? 0), 0);
  const manifest = { tool: 'built-in image_gen; derivative encoding with sharp/libwebp', compression: 'WebP effort 6, role-specific sizes; encoded once from original PNG, no cropping', profile: PROFILE, images, runtimeLogo: { image: 'assets/logo-ui.webp', ...logo }, nativeImages: native };
  await fs.writeFile('docs/ARTWORK-MANIFEST.json', JSON.stringify(manifest, null, 2) + '\n');

  const row = x => '  { id: ' + JSON.stringify(x.id) + ', title: ' + JSON.stringify(x.title) + ', image: require(' + JSON.stringify('../../' + x.image) + '), thumbnail: require(' + JSON.stringify('../../' + (x.thumbnail ?? x.image)) + ') },';
  let source = "import type { ImageSource } from 'expo-image';\nimport { CivilDate, dayNumber, mod } from '../lib/calendar';\nexport type Artwork = { id: string; title: string; image: number | ImageSource; thumbnail: number | ImageSource };\n";
  source += 'export const taoArtwork: Artwork[] = [\n' + images.filter(x => x.kind === 'tao').map(row).join('\n') + '\n];\n';
  source += 'export const villageArtworkSet: Artwork[] = [\n' + images.filter(x => x.kind === 'village').map(row).join('\n') + '\n];\n';
  source += "export function chapterArtwork(chapter: number) { if (!Number.isInteger(chapter) || chapter < 1 || chapter > 81) throw new Error('Invalid chapter'); return taoArtwork[chapter - 1]; }\nexport function villageArtwork(date: CivilDate, offset = 0) { return villageArtworkSet[mod(dayNumber(date) + offset, villageArtworkSet.length)]; }\n";
  await fs.writeFile('src/data/artwork.ts', source);
  const obsolete = priorResources.filter(file => /\.jpe?g$/i.test(file));
  await fs.writeFile('art-originals/manifests/obsolete-runtime-jpeg.json', JSON.stringify(obsolete, null, 2));
  const report = { beforeArtworkBytes: beforeBytes, afterArtworkBytes: totalArtworkBytes, savedPercent: beforeBytes ? +(100 * (1 - totalArtworkBytes / beforeBytes)).toFixed(2) : null,
    mainImages: images.length, thumbnails: images.filter(x => x.thumbnail).length, runtimeLogoBytes: logo.bytes, nativePNGBytes: native.reduce((s, x) => s + x.bytes, 0), profile: PROFILE };
  await fs.writeFile('docs/IMAGE-OPTIMIZATION.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await optimizeArtwork();
