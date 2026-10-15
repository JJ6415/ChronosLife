import json

def update_json(filepath, updates):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for k, v in updates.items():
        if isinstance(v, dict) and k in data and isinstance(data[k], dict):
            data[k].update(v)
        else:
            data[k] = v
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

ko_updates = {
    'Page': {
        'status_layer0': 'Layer 0: Privacy Sandbox가 초민감 개인정보 실시간 가상 토큰화를 진행 중입니다...',
        'status_layer0_done': 'Layer 0: Privacy Sandbox - 초민감 개인정보 실시간 가상 토큰화 완료!',
        'status_layer1': 'Layer 1: 인텐트 오케스트레이션 - 비식별 프롬프트 인텐트 분해 & 에이전트 지침 배분 완료!',
        'status_layer2': 'Layer 2: 3대 서브에이전트(재정/커리어/웰빙) 헌법 가드레일 심의 완료!',
        'status_layer3': 'Layer 3: 최고 중재관 판결 및 지속가능한 파레토 카운터오퍼 도출 완료!',
        'status_layer4': 'Layer 4 & 5: 기준 vs 원안 vs 중재안 3중 궤적 및 5컷 웹툰 크로니클 렌더링 완료!',
        'status_complete': '모든 계층의 라이프 거버넌스 심의 및 크로니클이 완성되었습니다.',
        'status_history_loaded': '저장된 과거 심의 기록을 대시보드에 불러왔습니다.'
    }
}
en_updates = {
    'Page': {
        'status_layer0': 'Layer 0: Privacy Sandbox is running real-time tokenization of sensitive data...',
        'status_layer0_done': 'Layer 0: Privacy Sandbox - Real-time tokenization complete!',
        'status_layer1': 'Layer 1: Intent Orchestration - Intent decomposition & agent instructions distributed!',
        'status_layer2': 'Layer 2: 3 Sub-agents (Finance/Career/Wellbeing) deliberation complete!',
        'status_layer3': 'Layer 3: Chief Governor ruling & sustainable Pareto counter-offer generated!',
        'status_layer4': 'Layer 4 & 5: 3-way trajectory & 5-cut Webtoon Chronicle rendering complete!',
        'status_complete': 'All layers of life governance deliberation and chronicle are complete.',
        'status_history_loaded': 'Saved past deliberation record loaded into the dashboard.'
    }
}
ja_updates = {
    'Page': {
        'status_layer0': 'Layer 0: プライバシー・サンドボックスが個人情報のリアルタイムトークン化を進行中です...',
        'status_layer0_done': 'Layer 0: プライバシー・サンドボックス - リアルタイムトークン化完了！',
        'status_layer1': 'Layer 1: インテント・オーケストレーション - インテントの分解とエージェントへの指示完了！',
        'status_layer2': 'Layer 2: 3大サブエージェント（財政/キャリア/ウェルビーイング）の審議完了！',
        'status_layer3': 'Layer 3: 最高仲裁官の判決および持続可能なパレートカウンターオファー生成完了！',
        'status_layer4': 'Layer 4 & 5: 3種の軌跡および5コマウェブトゥーン・クロニクルのレンダリング完了！',
        'status_complete': '全階層のライフガバナンス審議およびクロニクルが完成しました。',
        'status_history_loaded': '保存された過去の審議記録をダッシュボードに読み込みました。'
    }
}

update_json('src/messages/ko.json', ko_updates)
update_json('src/messages/en.json', en_updates)
update_json('src/messages/ja.json', ja_updates)
print("Updated page json files successfully.")
