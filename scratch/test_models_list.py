import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
from google import genai

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
models = list(client.models.list())
for m in models[:5]:
    print(f"Name: {m.name}")
    print(f"Display Name: {getattr(m, 'display_name', None)}")
    print(f"Description: {getattr(m, 'description', '')[:50]}")
    print(f"Supported Actions: {getattr(m, 'supported_actions', None)}")
    print("---")
