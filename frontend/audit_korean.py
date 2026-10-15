import os, re, glob

pattern = re.compile(r'[\uac00-\ud7a3]+')
for path in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    korean_lines = []
    for idx, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            continue
        m = pattern.findall(line)
        if m:
            korean_lines.append((idx + 1, ' '.join(m[:5])))
    if korean_lines:
        print(f"=== {path} ({len(korean_lines)} lines with Korean) ===")
        for lno, text in korean_lines[:6]:
            print(f"  L{lno}: {text}")
