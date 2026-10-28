"""Package the actual iphoneos archive, preserving permissions and symlinks via ditto."""
from pathlib import Path
import hashlib, json, os, plistlib, shutil, subprocess

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
}
(build / 'IPA-INFO.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
