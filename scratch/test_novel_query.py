import requests
import json

url = "http://127.0.0.1:8080/api/analyze"
payload = {
    "raw_input": "주말에 친구들이랑 제주도 골프 여행 가려고 80만 원 비행기랑 리조트 예약하려고 해. 지금 회사 프로젝트가 한창 바쁜데 다녀와도 될까?",
    "model_name": "gemini-3.5-flash-lite"
}

res = requests.post(url, json=payload, timeout=20)
print("Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    with open("scratch/novel_result.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2))
    print("Novel Query test passed!")
else:
    print("Error:", res.text)
