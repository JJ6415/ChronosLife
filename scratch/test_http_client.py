import requests
import json

url = "http://127.0.0.1:8080/api/analyze"
payload = {
    "raw_input": "초기 AI 스타트업에서 연봉 3,500만 원 인상 제안을 받았습니다. 단, 주 70시간 근무에 주말 출근이 빈번합니다. 3년 시드머니를 빨리 모으고 싶은데 이직할까요?",
    "model_name": "gemini-3.5-flash-lite"
}

res = requests.post(url, json=payload, timeout=20)
with open("scratch/response_sample.json", "w", encoding="utf-8") as f:
    f.write(json.dumps(res.json(), ensure_ascii=False, indent=2))

print("Status:", res.status_code)
print("Saved to scratch/response_sample.json successfully!")
