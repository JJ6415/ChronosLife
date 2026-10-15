import requests
import json

url = "http://127.0.0.1:8080/api/analyze"
payload = {
    "raw_input": "오늘 12만 원짜리 노이즈캔슬링 헤드폰 결제했어.",
    "daily_budget": 150000.0,
    "model_name": "gemini-3.5-flash-lite"
}

res = requests.post(url, json=payload, timeout=20)
print("Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    cv = data.get("council_verdict", {})
    fin = cv.get("finance", {})
    print("Finance Stance:", fin.get("stance"))
    print("Finance Applied Budget:", fin.get("applied_guardrails"))
    print("Finance Reasoning:", fin.get("reasoning"))
