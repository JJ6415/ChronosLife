import os
import sys
import time

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("1. Testing Health Check...")
res = client.get("/")
print("Health:", res.status_code, res.json())

print("\n2. Testing /api/analyze with Startup Scenario...")
t0 = time.time()
payload = {
    "raw_input": "초기 AI 스타트업에서 연봉 3,500만 원 인상 제안을 받았습니다. 단, 주 70시간 근무에 주말 출근이 빈번합니다. 3년 시드머니를 빨리 모으고 싶은데 이직할까요?",
    "model_name": "gemini-3.5-flash-lite"
}
res = client.post("/api/analyze", json=payload)
elapsed = time.time() - t0
print(f"Status: {res.status_code} in {elapsed:.2f}s")
if res.status_code == 200:
    data = res.json()
    print("Intent:", data.get("orchestration_trace", {}).get("intent_label"))
    print("Governor Ruling:", data.get("governor_ruling", {}).get("decision"))
    print("Counter Offer:", data.get("governor_ruling", {}).get("pareto_counter_offer")[:80] if data.get("governor_ruling", {}).get("pareto_counter_offer") else "None")
    print("Trajectory Tiers:", len(data.get("composite_trajectory", [])))
else:
    print("Error:", res.text)
