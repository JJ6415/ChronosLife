import os

for root, dirs, files in os.walk('.'):
    if any(p in root for p in ['.git', 'node_modules', '.next', '.venv']):
        continue
    for f in files:
        if f.endswith(('.py', '.ts', '.tsx', '.json')):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8') as fp:
                    for i, line in enumerate(fp, 1):
                        if '40000' in line or '40,000' in line:
                            print(f"{p}:{i} -> {line.strip()[:100]}")
            except Exception:
                pass
