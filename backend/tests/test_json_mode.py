import os
from dotenv import load_dotenv
load_dotenv('.env')
from google import genai
from google.genai import types

c = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

# 1. response_mime_type="application/json" 테스트
try:
    r1 = c.models.generate_content(
        model='gemini-flash-latest',
        contents='JSON 형식으로 {"reply": "테스트"} 라고 답해줘',
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    print("JSON mode success:", r1.text[:50])
except Exception as e:
    print("JSON mode failed:", e)

# 2. 일반 텍스트 모드 테스트
try:
    r2 = c.models.generate_content(
        model='gemini-flash-latest',
        contents='JSON 형식으로 {"reply": "테스트"} 라고 답해줘'
    )
    print("Plain mode success:", r2.text[:50])
except Exception as e:
    print("Plain mode failed:", e)

# 3. gemini-3.1-flash-lite 테스트
try:
    r3 = c.models.generate_content(
        model='gemini-3.1-flash-lite',
        contents='JSON 형식으로 {"reply": "테스트"} 라고 답해줘'
    )
    print("gemini-3.1-flash-lite success:", r3.text[:50])
except Exception as e:
    print("gemini-3.1-flash-lite failed:", e)
