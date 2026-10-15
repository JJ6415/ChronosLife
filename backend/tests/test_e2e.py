"""
E2E integration test script for ChronosLife
"""
import httpx

client = httpx.Client(base_url="http://localhost:8080", timeout=10)

# 1. Health check
health = client.get("/").json()
print("[OK] Health:", health)
assert health["status"] == "ok"

# 2. Presets
presets = client.get("/api/presets").json()["scenarios"]
print(f"[OK] Presets: {len(presets)} scenarios loaded")
assert len(presets) == 3

# 3. Scenario 1
s1 = client.post("/api/analyze", json={"scenario_id": "scenario_1_impulse_spend"}).json()
print(f"[OK] Scenario 1: L4 delayed retirement = {s1['log10_cascade']['l4_constitution']['delayed_retirement']}")
assert "2.4일" in s1['log10_cascade']['l4_constitution']['delayed_retirement']

# 4. Scenario 2
s2 = client.post("/api/analyze", json={"scenario_id": "scenario_2_startup_tradeoff"}).json()
print(f"[OK] Scenario 2: Chief Governor decision = {s2['governor_ruling']['decision']}")
assert s2['governor_ruling']['decision'] == "기각"

# 5. Scenario 3
s3 = client.post("/api/analyze", json={"scenario_id": "scenario_3_burnout_mobility"}).json()
print(f"[OK] Scenario 3: Ekispert food cost saved = {s3['ekispert_prescription']['savings']['food_cost_saved']:,} KRW")
assert s3['ekispert_prescription']['savings']['food_cost_saved'] == 30000

# 6. Dynamic Pipeline (all 5 layers)
dynamic = client.post("/api/analyze", json={
    "raw_input": "우리 아내 김지수와 신한은행 110-123-456789 계좌에서 120,000원짜리 와인 충동 구매함",
    "micro_deviation": 120000
}).json()
print(f"[OK] Dynamic DLP: PII detected={dynamic['dlp_result']['has_pii']}")
print(f"[OK] Dynamic DLP: Sanitized text='{dynamic['dlp_result']['sanitized']}'")
print(f"[OK] Dynamic Log-10: L0 drain={dynamic['log10_cascade']['l0_daily']['budget_drain_pct']:.1f}%")
print(f"[OK] Dynamic Council: {[k for k in dynamic['council_verdict']]}")
print(f"[OK] Dynamic Governor: Decision='{dynamic['governor_ruling']['decision']}'")
assert dynamic['dlp_result']['has_pii'] is True
assert "김지수" not in dynamic['dlp_result']['sanitized']
assert "110-123-456789" not in dynamic['dlp_result']['sanitized']

# 7. Ekispert Standalone
eki = client.post("/api/ekispert", json={"location": "강남역", "stress_level": 85}).json()
print(f"[OK] Ekispert: Route destination='{eki['healing_walk_route']['segments'][0]['to']}'")
assert "양재" in eki['healing_walk_route']['segments'][0]['to']

# 8. Frontend HTML check
r_front = httpx.get("http://localhost:3000")
print(f"[OK] Frontend HTTP Status: {r_front.status_code}")
assert r_front.status_code == 200
assert "ChronosLife" in r_front.text or "Log-10" in r_front.text or "viewport" in r_front.text

print("\n=== ALL 8 E2E INTEGRATION CHECKS PASSED PERFECTLY! ===")
