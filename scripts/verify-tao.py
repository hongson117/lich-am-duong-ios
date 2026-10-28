"""Check each original quote against its numbered chapter in a local source snapshot.
Usage: python scripts/verify-tao.py ../tao-source.html
Only Chinese characters are compared, allowing punctuation variants.
"""
import html, json, re, sys
from pathlib import Path
source = Path(sys.argv[1]).read_text(encoding='utf-8')
parts = re.split(r'<h2 id="([^"]+)">', source)
sections = {parts[i]: html.unescape(re.sub(r'<[^>]+>', '', re.sub(r'<dl>.*?</dl>', '', parts[i+1], flags=re.S))) for i in range(1, len(parts)-1, 2)}
digits = '零一二三四五六七八九'
def chinese(n):
    if n < 10: return digits[n]
    return (digits[n//10] if n >= 20 else '') + '十' + (digits[n%10] if n%10 else '')
def normalize(text): return re.sub(r'[^\u3400-\u9fff]', '', text)
data = json.loads((Path(__file__).resolve().parent.parent / 'src/data/tao-passages.json').read_text(encoding='utf-8'))
errors = []
for q in data:
    section = sections.get(chinese(q['chapter']) + '章', '')
    if normalize(q['original']) not in normalize(section): errors.append({'chapter': q['chapter'], 'original': q['original']})
print(json.dumps({'checked': len(data), 'matched': len(data)-len(errors), 'mismatches': errors}, ensure_ascii=False, indent=2))
sys.exit(bool(errors))
