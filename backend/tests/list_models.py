import os
from dotenv import load_dotenv
load_dotenv('.env')
from google import genai

c = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
try:
    for m in c.models.list():
        if 'generateContent' in m.supported_actions or True:
            print("Model:", m.name)
except Exception as e:
    print("Error listing models:", e)
