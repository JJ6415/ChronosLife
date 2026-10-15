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
    'Console': {
        'orchestration_console_title': '실시간 인생 거버넌스 오케스트레이션 콘솔',
        'orchestration_console_desc': '상위 오케스트레이터가 발화의 본질(지출 vs 연봉 오퍼 vs 신체 회복)을 판별하여 전문 에이전트에 지침을 하달합니다.',
        'model_select_title': 'Google GenAI API에서 실시간으로 불러온 최신 Gemini 모델 목록입니다',
        'model_refresh_title': 'Google AI API에서 최신 Gemini 모델 목록 실시간 새로고침',
        'models_synced_badge': '{count}개 모델 실시간 동기화',
        'reset': '초기화'
    }
}

en_updates = {
    'Console': {
        'orchestration_console_title': 'Real-time Life Governance Orchestration Console',
        'orchestration_console_desc': 'The chief orchestrator discerns the essence of the utterance (expense vs. offer vs. wellness recovery) and dispatches directives to domain agents.',
        'model_select_title': 'Latest Gemini model list loaded in real time from Google GenAI API',
        'model_refresh_title': 'Refresh latest Gemini model list in real time from Google AI API',
        'models_synced_badge': '{count} models synced in real-time',
        'reset': 'Reset'
    }
}

ja_updates = {
    'Console': {
        'orchestration_console_title': 'リアルタイム・ライフガバナンス・オーケストレーション・コンソール',
        'orchestration_console_desc': '上位オーケストレーターが発話の本質（支出 vs 年収オファー vs 身体回復）を判別し、専門エージェントへ指示を下達します。',
        'model_select_title': 'Google GenAI APIからリアルタイムで取得した最新Geminiモデル一覧です',
        'model_refresh_title': 'Google AI APIから最新Geminiモデル一覧をリアルタイム更新',
        'models_synced_badge': '{count}個のモデルをリアルタイム同期中',
        'reset': 'リセット'
    }
}

update_json('src/messages/ko.json', ko_updates)
update_json('src/messages/en.json', en_updates)
update_json('src/messages/ja.json', ja_updates)
print("Updated Console messages successfully.")
