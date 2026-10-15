import os
from dotenv import load_dotenv
load_dotenv('.env')
from google import genai

c = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
candidate_models = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite'
]

for m in candidate_models:
    try:
        r = c.models.generate_content(model=m, contents="hello")
        print(f"SUCCESS: {m} -> {r.text.strip()[:30]}")
    except Exception as e:
        print(f"FAILED: {m} -> {str(e)[:50]}")
