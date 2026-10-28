"""Package the actual iphoneos archive, preserving permissions and symlinks via ditto."""
from pathlib import Path
import hashlib, json, os, plistlib, subprocess

root = Path(__file__).resolve().parent.parent
build = root / 'build'
applications = build / 'LichAmDuong.xcarchive/Products/Applications'
apps = list(applications.glob('*.app'))
if len(apps) != 1:
    raise SystemExit(f'Expected one archived app, found {len(apps)}')
app = apps[0]
with (app / 'Info.plist').open('rb') as f:
    info = plistlib.load(f)
if 'iPhoneOS' not in info.get('CFBundleSupportedPlatforms', []):
    raise SystemExit('This is not a physical-device iPhoneOS build')
executable = app / info['CFBundleExecutable']
if not executable.is_file():
    raise SystemExit('Missing native app executable')
architectures = subprocess.check_output(['lipo', '-archs', str(executable)], text=True).strip()
if 'arm64' not in architectures.split():
    raise SystemExit(f'Missing arm64 architecture: {architectures}')
manifest = json.loads((root / 'docs/ARTWORK-MANIFEST.json').read_text(encoding='utf-8'))
expected_art = {x['sha256'] for x in manifest['images']}
expected_thumbs = {x['thumbnailSHA256'] for x in manifest['images'] if x.get('thumbnailSHA256')}
bundled_webp = list(app.rglob('*.webp'))
bundled_hashes = {hashlib.sha256(p.read_bytes()).hexdigest() for p in bundled_webp}
if not expected_art.issubset(bundled_hashes) or not expected_thumbs.issubset(bundled_hashes):
    raise SystemExit('Some WebP artwork is missing from the compiled app')
if manifest['runtimeLogo']['sha256'] not in bundled_hashes:
    raise SystemExit('Optimized runtime logo is missing')
legacy = [str(p.relative_to(app)) for p in app.rglob('*') if p.suffix.lower() in {'.jpg', '.jpeg'}]
if legacy:
    raise SystemExit('Unexpected legacy JPEGs in compiled app: ' + repr(legacy[:5]))
payload = build / 'ipa/Payload'
payload.mkdir(parents=True, exist_ok=True)
destination = payload / app.name
subprocess.run(['ditto', str(app), str(destination)], check=True)
ipa = build / 'Lich-Am-Duong-unsigned.ipa'
subprocess.run(['ditto', '-c', '-k', '--sequesterRsrc', '--keepParent', str(payload), str(ipa)], check=True)
digest = hashlib.sha256(ipa.read_bytes()).hexdigest()
(build / 'SHA256SUMS.txt').write_text(f'{digest}  {ipa.name}\n', encoding='utf-8')
result = {
    'name': info.get('CFBundleDisplayName', info.get('CFBundleName')),
    'bundleIdentifier': info['CFBundleIdentifier'],
    'version': info['CFBundleShortVersionString'],
    'buildNumber': info['CFBundleVersion'],
    'platform': info['CFBundleSupportedPlatforms'],
    'architectures': architectures,
    'signing': 'unsigned — user must sign with a valid certificate and profiles before installing',
    'extensions': [p.name for p in (app / 'PlugIns').glob('*.appex')],
    'sha256': digest,
    'sizeBytes': ipa.stat().st_size,
    'commit': os.environ.get('GITHUB_SHA'),
    'artworkFormat': 'webp',
    'verifiedIllustrations': len(expected_art),
    'verifiedThumbnails': len(expected_thumbs),
    'bundledWebPBytes': sum(p.stat().st_size for p in bundled_webp),
}
(build / 'IPA-INFO.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
