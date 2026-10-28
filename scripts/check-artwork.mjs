import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('docs/ARTWORK-MANIFEST.json', 'utf8')).images;
for (const [kind, count] of [['tao', 81], ['village', 31]]) {
  const entries = manifest.filter(x => x.kind === kind);
  if (entries.length !== count) throw new Error(kind + ': expected ' + count + ' images, found ' + entries.length);
  if (new Set(entries.map(x => x.sha256)).size !== count) throw new Error('Duplicate artwork in ' + kind);
  for (let i = 1; i <= count; i++) {
    const id = kind + '-' + String(i).padStart(2, '0');
    const entry = entries.find(x => x.id === id);
    if (!entry || !fs.existsSync(entry.image)) throw new Error('Missing ' + id);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(entry.image)).digest('hex');
    if (hash !== entry.sha256) throw new Error('Hash mismatch: ' + id);
  }
}
console.log('Verified: 81 unique chapter illustrations and 31 unique Vietnamese tab illustrations.');
