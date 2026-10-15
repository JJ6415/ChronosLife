import urllib.request
import json
import time

def test_stream_api():
    print("Testing /api/analyze/stream...")
    req = urllib.request.Request(
        'http://127.0.0.1:8080/api/analyze/stream',
        data=json.dumps({
            'raw_input': '오늘 야근 너무 힘들어서 4만원 주고 택시 타고 갈래',
            'model_name': 'gemini-3.5-flash-lite'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    t0 = time.time()
    res = urllib.request.urlopen(req, timeout=40)
    print(f"Connected to stream: Status {res.status}")
    
    stage_count = 0
    buffer = ""
    while True:
        chunk = res.readline().decode('utf-8', errors='replace')
        if not chunk:
            break
        buffer += chunk
        if buffer.endswith("\n\n"):
            line = buffer.strip()
            buffer = ""
            if line.startswith("data:"):
                json_part = line[5:].strip()
                try:
                    payload = json.loads(json_part)
                    stage = payload.get("stage")
                    elapsed = time.time() - t0
                    stage_count += 1
                    print(f"[{elapsed:.2f}s] Stage {stage_count}: Received event '{stage}'")
                except Exception as e:
                    print("JSON parse error:", e)
    print("Stream finished successfully!")

if __name__ == '__main__':
    test_stream_api()
