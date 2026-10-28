import html, json, re, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]).read_text(encoding='utf-8')
parts = re.split(r'<h2 id="([^"]+)">', source)
sections = {parts[i]: parts[i+1] for i in range(1, len(parts)-1, 2)}
digits = '零一二三四五六七八九'
def chinese(n):
    if n < 10: return digits[n]
    return (digits[n//10] if n >= 20 else '') + '十' + (digits[n%10] if n%10 else '')
chapters = []
for n in range(1, 82):
    part = sections[chinese(n) + '章']
    part = re.sub(r'<dl\b[^>]*>.*?</dl>', '', part, flags=re.S)
    part = re.sub(r'<sup\b[^>]*>.*?</sup>', '', part, flags=re.S)
    paras = re.findall(r'<p\b[^>]*>(.*?)</p>', part, flags=re.S)
    original = '\n'.join(html.unescape(re.sub(r'<[^>]+>', '', p)).strip() for p in paras)
    original = re.sub(r'\[\d+\]', '', original)
    assert len(original) > 10, n
    chapters.append({'chapter': n, 'original': original, 'source': 'https://zh.wikisource.org/wiki/道德經_(王弼本)#' + chinese(n) + '章'})
(root / 'src/data/tao-chapters-original.json').write_text(json.dumps(chapters, ensure_ascii=False, indent=2), encoding='utf-8')
print('Extracted',len(chapters),'chapters. Chapter 45:',chapters[44]['original'])
