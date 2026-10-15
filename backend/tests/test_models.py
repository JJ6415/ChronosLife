import os
from dotenv import load_dotenv
load_dotenv('.env')
from google import genai

c = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']

for m in models:
    try:
        r = c.models.generate_content(model=m, contents="안녕하세요 한 마디만 해주세요")
        print(f"[OK] {m}: {r.text.strip()[:30]}")
        break
    except Exception as e:
        print(f"[FAIL] {m}: {e}")
