import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
from google import genai

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
models = list(client.models.list())

filtered = []
for m in models:
    name = m.name.replace("models/", "")
    actions = getattr(m, 'supported_actions', []) or []
    if 'generateContent' not in actions:
        continue
    # Exclude specialized non-text models
    if any(k in name.lower() for k in ['tts', 'native-audio', 'image', 'embedding', 'robotics', 'transcribe', 'computer-use', 'live-translate']):
        continue
    filtered.append({
        "id": name,
        "name": getattr(m, 'display_name', name),
        "description": getattr(m, 'description', '')
    })

print(f"Total eligible models: {len(filtered)}")
for f in filtered:
    print(f"[{f['id']}] {f['name']}")
