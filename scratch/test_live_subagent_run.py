import requests
import json

url = "http://127.0.0.1:8080/api/analyze"
payload = {
    "raw_input": "오늘 너무 스트레스 받아서 12만 원짜리 노이즈캔슬링 헤드폰 결제했어.",
    "model_name": "gemini-3.5-flash-lite"
}

res = requests.post(url, json=payload, timeout=20)
print("Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    cv = data.get("council_verdict", {})
    print("Finance Agent:", cv.get("finance", {}).get("agent_role"))
    print("Finance Stance:", cv.get("finance", {}).get("stance"))
    print("Finance Applied:", cv.get("finance", {}).get("applied_guardrails"))
    print("Career Agent:", cv.get("career", {}).get("agent_role"))
    print("Wellbeing Agent:", cv.get("wellbeing", {}).get("agent_role"))
    print("Ruling:", data.get("governor_ruling", {}).get("decision"))
else:
    print("Error:", res.text)
