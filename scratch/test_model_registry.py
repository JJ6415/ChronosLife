import os
import time
from dotenv import load_dotenv
load_dotenv('backend/.env')
from google import genai

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

models = list(client.models.list())
result = []
for m in models:
    raw_name = m.name or ""
    model_id = raw_name.replace("models/", "")
    actions = getattr(m, 'supported_actions', []) or []

    # Filter text generation gemini models
    if not model_id.startswith("gemini-"):
        continue
    if "generateContent" not in actions:
        continue
    if any(k in model_id.lower() for k in ["tts", "native-audio", "image", "embedding", "robotics", "transcribe", "computer-use", "live-translate"]):
        continue
    if model_id in ["gemini-2.5-flash", "gemini-2.5-flash-lite"]: # Deprecated 404
        continue

    # Meta
    display_name = getattr(m, "display_name", model_id)
    badge = "General"
    desc = getattr(m, "description", "") or "Gemini LLM Engine"
    is_rec = False

    if model_id == "gemini-3.5-flash-lite":
        badge = "Recommended"
        desc = "초고속 (0.8초) · 실시간 무지연 권장 엔진"
        is_rec = True
    elif "flash-lite" in model_id:
        badge = "Ultra Fast"
        desc = "초경량 초고속 저지연"
    elif "pro" in model_id:
        badge = "Pro Reasoning"
        desc = "최고 수준 복합 논리 추론"
    elif "flash" in model_id:
        badge = "Flash"
        desc = "균형 잡힌 고성능 모델"

    result.append({
        "id": model_id,
        "name": display_name,
        "desc": desc,
        "badge": badge,
        "is_recommended": is_rec
    })

# Priority sorting: Recommended first, then lite, then others
def sort_key(item):
    if item["is_recommended"]:
        return (0, item["id"])
    if "lite" in item["id"]:
        return (1, item["id"])
    if "flash" in item["id"]:
        return (2, item["id"])
    return (3, item["id"])

result.sort(key=sort_key)
print(f"Total dynamic Gemini models available: {len(result)}")
for r in result:
    print(f"[{r['badge']}] {r['id']} ({r['name']}) -> {r['desc']}")
