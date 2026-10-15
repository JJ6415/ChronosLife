import requests
import json

url = "http://127.0.0.1:8080/api/goals/chat"
payload = {
    "message": "야근이 너무 많아서 주말 취미(러닝)와 개인 시간을 꼭 지키고 싶어요.",
    "model_name": "gemini-3.5-flash-lite"
}

res = requests.post(url, json=payload, timeout=20)
print("Chat Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    with open("scratch/chat_response_sample.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2))
    print("Chat Response saved successfully!")
else:
    print("Chat Error:", res.text)
