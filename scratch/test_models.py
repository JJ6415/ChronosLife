import os
import time
from dotenv import load_dotenv
load_dotenv('backend/.env')
from google import genai

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
models = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-3.5-flash'
]

for m in models:
    t0 = time.time()
    try:
        res = client.models.generate_content(model=m, contents='Say hello in Korean')
        print(f'{m}: {time.time()-t0:.2f}s')
    except Exception as e:
        print(f'{m}: FAILED -> {e}')
