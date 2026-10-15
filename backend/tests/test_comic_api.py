import urllib.request
import json
import time

def test_api():
    print("Testing /api/analyze...")
    req = urllib.request.Request(
        'http://127.0.0.1:8080/api/analyze',
        data=json.dumps({
            'raw_input': '오늘 야근 너무 힘들어서 4만원 주고 택시 타고 갈래',
            'model_name': 'gemini-3.5-flash-lite'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    t0 = time.time()
    res = urllib.request.urlopen(req, timeout=30)
    data = json.loads(res.read().decode('utf-8'))
    t1 = time.time()
    
    print(f"Status: {res.status} (Elapsed: {t1-t0:.2f}s)")
    comic = data.get('log10_comic', {})
    print(f"Comic Title: {comic.get('comic_title')}")
    print(f"Model Used: {comic.get('model_used')}")
    print(f"Cuts count: {len(comic.get('cuts', []))}")
    for c in comic.get('cuts', []):
        print(f"  - Cut {c.get('panel_number')} [{c.get('scale_label')}]: {c.get('title')} ({c.get('emotion')}) | Score: {c.get('life_score')}")
    print(f"Takeaway: {comic.get('takeaway_message')}")

if __name__ == '__main__':
    test_api()
