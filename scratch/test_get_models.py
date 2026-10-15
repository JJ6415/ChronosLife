import requests
import json

res = requests.get("http://127.0.0.1:8080/api/models")
print("Status:", res.status_code)
data = res.json()
print("Total models:", len(data.get("models", [])))
for m in data.get("models", []):
    print(f"- {m['id']} ({m['name']}) [{m['badge']}]")
