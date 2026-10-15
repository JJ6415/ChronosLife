import urllib.request
import json
import time

def test_live_voice():
    print("Testing /api/goals/live-voice...")
    req = urllib.request.Request(
        'http://127.0.0.1:8080/api/goals/live-voice',
        data=json.dumps({
            'voice_transcript': '나 요즘 야근 때문에 너무 피곤해서 주말 러닝 4시간과 수면 7시간은 헌법으로 꼭 지키고 싶어',
            'model_name': 'gemini-3.5-flash-lite'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    t0 = time.time()
    res = urllib.request.urlopen(req, timeout=30)
    data = json.loads(res.read().decode('utf-8'))
    t1 = time.time()
    
    print(f"Status: {res.status} (Elapsed: {t1-t0:.2f}s)")
    print(f"Mode: {data.get('mode')}")
    print(f"Voice Reply: {data.get('voice_reply')[:80]}...")
    print(f"Focus Category: {data.get('focus_category')}")
    print(f"Audio Hint: {data.get('voice_audio_hint')}")
    print(f"Updated Goals: {list(data.get('updated_goals', {}).keys())}")
    print("Test passed successfully!")

if __name__ == '__main__':
    test_live_voice()
