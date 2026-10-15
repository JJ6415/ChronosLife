import os
from dotenv import load_dotenv
load_dotenv('.env')
from google import genai

c = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
for m in ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.1-pro-preview']:
    try:
        r = c.models.generate_content(model=m, contents="안녕하세요 한 마디만 해주세요")
        print(f"[OK] {m}: {r.text.strip()[:40]}")
    except Exception as e:
        print(f"[FAIL] {m}: {e}")
