"""
ChronosLife Log-10 Comic Strip Engine (5컷 라이프 만화 생성 엔진)
Log-10 시계열 지평(10^0 1일, 10^1 10일, 10^2 100일, 10^3 3년, 10^4 30년)을
각각 한 컷으로 구성하는 5컷 만화(웹툰 스타일 크로니클) 스토리 및 비주얼 메타데이터를 생성합니다.
(사용자 요청: 폴백 및 더미 목업 전면 배제, 실제 API 상태 및 생성 결과 투명 제공)
"""
import os
import time
import json
import base64
import logging
from typing import Dict, Any, List, Optional
from engines.json_utils import parse_json_safely

logger = logging.getLogger(__name__)

class Log10ComicEngine:
    """
    Log-10 5대 시계열 지평을 5컷 웹툰 패널로 각색하는 멀티모달 스토리텔링 엔진.
    Gemini AI를 활용하여 사용자 발화, 도메인 심의, 중재관 판결을
    생생한 5컷 만화(씬 묘사, 캐릭터 독백, 에이전트 대사, 시각 테마, 감정)로 변환합니다.
    """

    def __init__(self):
        pass

    def generate_panel_image_with_interactions(
        self,
        scene_description: str,
        panel_num: int,
    ) -> Dict[str, Any]:
        """
        Google GenAI SDK의 client.interactions.create(model='gemini-3.1-flash-image')를
        직접 호출하여 실시간 웹툰 컷 이미지를 생성합니다.
        전용 이미지 API 키(GEMINI_IMAGE_API_KEY)를 우선 사용합니다.
        """
        api_key = os.environ.get("GEMINI_IMAGE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {
                "status": "error",
                "image_url": None,
                "message": "GEMINI_IMAGE_API_KEY 또는 GEMINI_API_KEY가 설정되지 않아 이미지 생성을 수행할 수 없습니다."
            }

        enable_img = os.environ.get("ENABLE_IMAGE_GENERATION", "false").lower() in ("true", "1", "yes")
        if not enable_img:
            logger.info("Image generation is currently disabled (ENABLE_IMAGE_GENERATION=False).")
            return {
                "status": "disabled",
                "image_url": None,
                "is_ai_generated": False,
                "message": "사용자 요청에 따라 이미지 생성기 기능이 현재 OFF 상태입니다."
            }

        start_time = time.time()
        prompt = f"Korean digital manhwa webtoon style illustration: {scene_description}. High contrast, cinematic lighting, vivid details, anime manhwa art style."
        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            if hasattr(client, "interactions") and hasattr(client.interactions, "sdk_configuration"):
                client.interactions.sdk_configuration.retry_config = None

            logger.info(f"[Interactions API] Attempting image creation for panel {panel_num} using gemini-3.1-flash-image...")

            interaction = client.interactions.create(
                model="gemini-3.1-flash-image",
                input=prompt,
                timeout=35.0,
            )

            duration_ms = (time.time() - start_time) * 1000.0

            if hasattr(interaction, "output_image") and interaction.output_image and getattr(interaction.output_image, "data", None):
                raw_bytes = base64.b64decode(interaction.output_image.data)
                target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "comics"))
                os.makedirs(target_dir, exist_ok=True)
                
                timestamp_str = int(time.time())
                target_filename = f"gen_cut_{panel_num}_{timestamp_str}.png"
                target_filepath = os.path.join(target_dir, target_filename)
                with open(target_filepath, "wb") as f:
                    f.write(raw_bytes)

                # 최신 파일 심볼릭/기본 경로에도 저장 (호환성)
                canonical_filepath = os.path.join(target_dir, f"gen_cut_{panel_num}.png")
                try:
                    with open(canonical_filepath, "wb") as f:
                        f.write(raw_bytes)
                except Exception:
                    pass

                # 개발자 인스펙터에 성공 로그 기록
                try:
                    from engines.dev_logger import dev_log_store
                    dev_log_store.log_llm_call(
                        caller=f"ComicEngine-Cut-{panel_num}",
                        model="gemini-3.1-flash-image",
                        prompt=prompt,
                        response_text=f"[Image Output] {len(raw_bytes)} bytes written to {target_filename}",
                        duration_ms=duration_ms
                    )
                except Exception:
                    pass

                logger.info(f"Successfully generated and saved panel {panel_num} via Interactions API to {target_filepath}")
                return {
                    "status": "ok",
                    "image_url": f"/comics/{target_filename}",
                    "is_ai_generated": True,
                    "message": "AI 이미지 실시간 생성 성공 (gemini-3.1-flash-image)"
                }
            else:
                return {
                    "status": "error",
                    "image_url": None,
                    "is_ai_generated": False,
                    "message": "API 응답에 output_image 데이터가 포함되지 않았습니다."
                }
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000.0
            err_str = str(e)
            logger.error(f"[Interactions API] Panel {panel_num} generation failed: {err_str}")

            try:
                from engines.dev_logger import dev_log_store
                dev_log_store.log_llm_call(
                    caller=f"ComicEngine-Cut-{panel_num}",
                    model="gemini-3.1-flash-image",
                    prompt=prompt,
                    response_text="",
                    duration_ms=duration_ms,
                    error=err_str
                )
            except Exception:
                pass

            if "429" in err_str or "limit: 0" in err_str:
                return {
                    "status": "error",
                    "image_url": None,
                    "is_ai_generated": False,
                    "error_code": 429,
                    "message": f"Google AI Studio 쿼터 초과 상태입니다: {err_str[:120]}"
                }
            return {
                "status": "error",
                "image_url": None,
                "is_ai_generated": False,
                "message": f"이미지 생성 API 호출 오류: {err_str}"
            }

    async def generate_5cut_comic(
        self,
        raw_input: str,
        intent_context: Any,
        cascade_result: Optional[Dict[str, Any]] = None,
        council_verdict: Optional[Dict[str, Any]] = None,
        governor_ruling: Optional[Dict[str, Any]] = None,
        preferred_model: str = "gemini-3.5-flash-lite",
        locale: str = "ko"
    ) -> Dict[str, Any]:
        """
        Gemini AI를 실시간 호출하여 5컷 만화 시나리오(씬 묘사, 대사, 시각 테마)를 생성합니다.
        (폴백 템플릿 제거: 실패 시 실제 오류 발생)
        """
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY가 없어 웹툰 스토리를 생성할 수 없습니다.")

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        models_to_try = [preferred_model, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"]

        if locale == "ja":
            prompt = f"""あなたは人生ガバナンスシステム『ChronosLife』の首席ウェブトゥーン作家兼マルチモーダル・ストーリーテラーAIです。
ユーザーの悩み/決定案件に基づき、**Log-10の5大時系列地平（1日、10日、100日、3年、30年）**をそれぞれ1コマで表現する計5コマの感動的で没入感あふれる「人生クロニクル・ウェブトゥーン（Comic Strip）」を創作してください。

[CRITICAL LANGUAGE MANDATE: JAPANESE (日本語)]
すべてのテキスト項目（comic_title, title, character_dialogue, agent_dialogue, narration, takeaway_message）を必ず自然な日本語で作成してください。
韓国語（ハングル文字）は絶対に出力に含めないでください。

[案件コンテキスト]:
- ユーザーの発話: "{raw_input}"
- インテント種別: {getattr(intent_context, 'intent_label', '未定')} ({getattr(intent_context, 'intent_type', 'GENERAL')})
- 金額/説明: {getattr(intent_context, 'amount_description', '該当なし')}
- 仲裁官判決要約: {governor_ruling.get('reasoning', '') if governor_ruling else '審議中'}
- カウンターオファー: {governor_ruling.get('pareto_counter_offer', '') if governor_ruling else 'なし'}

[5コマ構成指針]:
- Cut 1 (10^0, 1日 / 今夜): 決断の瞬間。主人公が直面する誘惑、疲労、衝動、または葛藤の現場。
- Cut 2 (10^1, 10日後): バッファの反応。10日間の初期疲労蓄積、または口座残高の微細な亀裂、最初の試練。
- Cut 3 (10^2, 100日後): 習慣とクールダウンの転換点。仲裁官のカウンターオファーを実践するか習慣が定着して訪れる反転。
- Cut 4 (10^3, 約3年後): 複利の雪だるまの可視化。支出節約や健康ルーティンが複利で増大し種銭やキャリアの飛躍として開花。
- Cut 5 (10^4, 約30年後): 30年後のパレート最適リタイアビジョン。30年前のその些細な決断のおかげで享受する自由で平和な人生。

必ず以下のJSON形式でのみ回答してください（キーは英語、値はすべて日本語）:
{{
    "comic_title": "魅力的な日本語ウェブトゥーンタイトル",
    "theme_tone": "urban-tech",
    "cuts": [
        {{
            "panel_number": 1,
            "tier": "L0",
            "scale_label": "10⁰ (1日)",
            "timeframe": "今夜",
            "title": "コマ1の小見出し（日本語）",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "主人公のリアルなセリフ（日本語）",
            "agent_dialogue": "Chronos AIのアドバイスセリフ（日本語）",
            "narration": "状況を説明するナレーション（日本語）",
            "emotion": "🔥",
            "visual_theme": "neon-night",
            "life_score": 62
        }},
        {{
            "panel_number": 2,
            "tier": "L1",
            "scale_label": "10¹ (10日)",
            "timeframe": "10日後",
            "title": "コマ2の小見出し（日本語）",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "主人公のセリフ（日本語）",
            "agent_dialogue": "エージェントのアドバイス（日本語）",
            "narration": "ナレーション（日本語）",
            "emotion": "⚡",
            "visual_theme": "alarm-dawn",
            "life_score": 58
        }},
        {{
            "panel_number": 3,
            "tier": "L2",
            "scale_label": "10² (100日)",
            "timeframe": "100日後",
            "title": "コマ3の小見出し（日本語）",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "主人公のセリフ（日本語）",
            "agent_dialogue": "エージェントのアドバイス（日本語）",
            "narration": "ナレーション（日本語）",
            "emotion": "🌱",
            "visual_theme": "fresh-morning",
            "life_score": 75
        }},
        {{
            "panel_number": 4,
            "tier": "L3",
            "scale_label": "10³ (3年)",
            "timeframe": "約3年後",
            "title": "コマ4の小見出し（日本語）",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "主人公のセリフ（日本語）",
            "agent_dialogue": "エージェントのアドバイス（日本語）",
            "narration": "ナレーション（日本語）",
            "emotion": "💎",
            "visual_theme": "golden-growth",
            "life_score": 86
        }},
        {{
            "panel_number": 5,
            "tier": "L4",
            "scale_label": "10⁴ (30年)",
            "timeframe": "約30年後",
            "title": "コマ5の小見出し（日本語）",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "主人公のセリフ（日本語）",
            "agent_dialogue": "エージェントのアドバイス（日本語）",
            "narration": "ナレーション（日本語）",
            "emotion": "👑",
            "visual_theme": "peaceful-sunset",
            "life_score": 96
        }}
    ],
    "takeaway_message": "読者に伝える感動的な1行の人生メッセージ（日本語）"
}}
"""
        elif locale == "en":
            prompt = f"""You are the Chief Comic Strip Storyteller AI for the life governance system 'ChronosLife'.
Based on the user's decision dilemma, create an immersive 5-cut Life Chronicle Webtoon (Comic Strip)
spanning the **Log-10 Temporal Horizons (1 Day, 10 Days, 100 Days, 3 Years, 30 Years)**, one cut per horizon.

[CRITICAL LANGUAGE MANDATE: ENGLISH]
ALL text values (comic_title, title, character_dialogue, agent_dialogue, narration, takeaway_message) MUST be written in natural, fluent English.
DO NOT include any Korean under any circumstances.

[Dilemma Context]:
- User Utterance: "{raw_input}"
- Intent Type: {getattr(intent_context, 'intent_label', 'Undecided')} ({getattr(intent_context, 'intent_type', 'GENERAL')})
- Amount / Description: {getattr(intent_context, 'amount_description', 'N/A')}
- Governor Ruling: {governor_ruling.get('reasoning', '') if governor_ruling else 'Deliberating'}
- Counter-Offer: {governor_ruling.get('pareto_counter_offer', '') if governor_ruling else 'None'}

[5-Cut Guidelines]:
- Cut 1 (10^0, 1 Day / Tonight): The moment of dilemma, temptation, fatigue, or conflict.
- Cut 2 (10^1, 10 Days Later): Buffer reaction. Early fatigue buildup or bank balance micro-fissure; first trial.
- Cut 3 (10^2, 100 Days Later): Habit and cooldown turning point. Executing the compromise or forming new routine.
- Cut 4 (10^3, Approx. 3 Years Later): Compounding snowball effect. Financial savings or health consistency blooms into major leap.
- Cut 5 (10^4, Approx. 30 Years Later): 30-year Pareto-optimal life vision. Freedom and peace enjoyed thanks to that small choice made 30 years ago.

Respond ONLY with the following JSON schema:
{{
    "comic_title": "Compelling English Comic Title",
    "theme_tone": "urban-tech",
    "cuts": [
        {{
            "panel_number": 1,
            "tier": "L0",
            "scale_label": "10⁰ (1 Day)",
            "timeframe": "Tonight",
            "title": "Panel 1 Title",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "Character dialogue in English",
            "agent_dialogue": "Chronos AI advice in English",
            "narration": "Narration in English",
            "emotion": "🔥",
            "visual_theme": "neon-night",
            "life_score": 62
        }},
        {{
            "panel_number": 2,
            "tier": "L1",
            "scale_label": "10¹ (10 Days)",
            "timeframe": "10 Days Later",
            "title": "Panel 2 Title",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "Character dialogue in English",
            "agent_dialogue": "Agent advice in English",
            "narration": "Narration in English",
            "emotion": "⚡",
            "visual_theme": "alarm-dawn",
            "life_score": 58
        }},
        {{
            "panel_number": 3,
            "tier": "L2",
            "scale_label": "10² (100 Days)",
            "timeframe": "100 Days Later",
            "title": "Panel 3 Title",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "Character dialogue in English",
            "agent_dialogue": "Agent advice in English",
            "narration": "Narration in English",
            "emotion": "🌱",
            "visual_theme": "fresh-morning",
            "life_score": 75
        }},
        {{
            "panel_number": 4,
            "tier": "L3",
            "scale_label": "10³ (3 Years)",
            "timeframe": "Approx. 3 Years Later",
            "title": "Panel 4 Title",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "Character dialogue in English",
            "agent_dialogue": "Agent advice in English",
            "narration": "Narration in English",
            "emotion": "💎",
            "visual_theme": "golden-growth",
            "life_score": 86
        }},
        {{
            "panel_number": 5,
            "tier": "L4",
            "scale_label": "10⁴ (30 Years)",
            "timeframe": "Approx. 30 Years Later",
            "title": "Panel 5 Title",
            "scene_description": "Scene description for illustration",
            "character_dialogue": "Character dialogue in English",
            "agent_dialogue": "Agent advice in English",
            "narration": "Narration in English",
            "emotion": "👑",
            "visual_theme": "peaceful-sunset",
            "life_score": 96
        }}
    ],
    "takeaway_message": "An inspiring one-line life message in English"
}}
"""
        else:
            prompt = f"""당신은 인생 거버넌스 시스템 'ChronosLife'의 수석 웹툰 작가 겸 멀티모달 스토리텔러 AI입니다.
사용자의 고민/결정 안건을 바탕으로, **Log-10의 5대 시계열 지평(1일, 10일, 100일, 3년, 30년)**을 
각각 한 컷으로 표현하는 총 5컷의 감동적이고 몰입감 넘치는 '인생 크로니클 웹툰(Comic Strip)'을 창작하세요.

[안건 컨텍스트]:
- 사용자 발화: "{raw_input}"
- 인텐트 유형: {getattr(intent_context, 'intent_label', '미정')} ({getattr(intent_context, 'intent_type', 'GENERAL')})
- 설명/금액: {getattr(intent_context, 'amount_description', '해당 없음')}
- 중재관 판결 요약: {governor_ruling.get('reasoning', '') if governor_ruling else '심의 중'}
- 카운터오퍼: {governor_ruling.get('pareto_counter_offer', '') if governor_ruling else '없음'}

[5컷 구성 원칙]:
- Cut 1 (10^0, 1일 / 오늘 밤): 결단의 순간. 주인공이 겪는 유혹, 피로, 충동, 또는 갈등의 현장.
- Cut 2 (10^1, 10일 후): 버퍼의 반응. 10일간의 초기 피로 누적 또는 통장 잔고의 미세한 균열, 첫 시험대.
- Cut 3 (10^2, 100일 후): 습관과 쿨다운의 전환점. 중재관의 카운터오퍼를 실천하거나 습관이 정착되며 찾아오는 반전.
- Cut 4 (10^3, 약 3년 후): 복리 눈덩이의 가시화. 지출 절약이나 건강 루틴이 복리로 불어나 종잣돈이나 커리어 도약으로 만개.
- Cut 5 (10^4, 약 30년 후): 30년 후 파레토 최적 은퇴 비전. 30년 전 그 사소한 결단 덕분에 누리는 자유롭고 평화로운 삶.

반드시 아래 JSON 형식으로만 응답하세요:
{{
    "comic_title": "한국어 웹툰 제목",
    "theme_tone": "urban-tech",
    "cuts": [
        {{
            "panel_number": 1,
            "tier": "L0",
            "scale_label": "10⁰ (1일)",
            "timeframe": "오늘 밤",
            "title": "1컷 소제목",
            "scene_description": "장면 묘사",
            "character_dialogue": "주인공 대사",
            "agent_dialogue": "에이전트 대사",
            "narration": "나레이션",
            "emotion": "🔥",
            "visual_theme": "neon-night",
            "life_score": 62
        }},
        {{
            "panel_number": 2,
            "tier": "L1",
            "scale_label": "10¹ (10일)",
            "timeframe": "10일 후",
            "title": "2컷 소제목",
            "scene_description": "장면 묘사",
            "character_dialogue": "주인공 대사",
            "agent_dialogue": "에이전트 대사",
            "narration": "나레이션",
            "emotion": "⚡",
            "visual_theme": "alarm-dawn",
            "life_score": 58
        }},
        {{
            "panel_number": 3,
            "tier": "L2",
            "scale_label": "10² (100일)",
            "timeframe": "100일 후",
            "title": "3컷 소제목",
            "scene_description": "장면 묘사",
            "character_dialogue": "주인공 대사",
            "agent_dialogue": "에이전트 대사",
            "narration": "나레이션",
            "emotion": "🌱",
            "visual_theme": "fresh-morning",
            "life_score": 75
        }},
        {{
            "panel_number": 4,
            "tier": "L3",
            "scale_label": "10³ (3년)",
            "timeframe": "약 3년 후",
            "title": "4컷 소제목",
            "scene_description": "장면 묘사",
            "character_dialogue": "주인공 대사",
            "agent_dialogue": "에이전트 대사",
            "narration": "나레이션",
            "emotion": "💎",
            "visual_theme": "golden-growth",
            "life_score": 86
        }},
        {{
            "panel_number": 5,
            "tier": "L4",
            "scale_label": "10⁴ (30년)",
            "timeframe": "약 30년 후",
            "title": "5컷 소제목",
            "scene_description": "장면 묘사",
            "character_dialogue": "주인공 대사",
            "agent_dialogue": "에이전트 대사",
            "narration": "나레이션",
            "emotion": "👑",
            "visual_theme": "peaceful-sunset",
            "life_score": 96
        }}
    ],
    "takeaway_message": "독자에게 전하는 감동적인 한 줄 인생 메시지"
}}
"""

        last_error = None
        for model in models_to_try:
            if not model:
                continue
            start_time = time.time()
            try:
                resp = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7,
                    )
                )
                duration_ms = (time.time() - start_time) * 1000.0
                parsed = parse_json_safely(resp.text)
                if parsed and "cuts" in parsed and len(parsed["cuts"]) == 5:
                    parsed["model_used"] = model
                    from engines.dev_logger import dev_log_store
                    dev_log_store.log_llm_call(
                        caller="Log10ComicEngine",
                        model=model,
                        prompt=prompt,
                        response_text=resp.text,
                        duration_ms=duration_ms
                    )

                    SCALE_MAP = {
                        "ja": {1: "10⁰ (1日)", 2: "10¹ (10日)", 3: "10² (100日)", 4: "10³ (3年)", 5: "10⁴ (30年)"},
                        "en": {1: "10⁰ (1 Day)", 2: "10¹ (10 Days)", 3: "10² (100 Days)", 4: "10³ (3 Years)", 5: "10⁴ (30 Years)"},
                        "ko": {1: "10⁰ (1일)", 2: "10¹ (10일)", 3: "10² (100일)", 4: "10³ (3년)", 5: "10⁴ (30년)"}
                    }
                    TIMEFRAME_MAP = {
                        "ja": {1: "今夜", 2: "10日後", 3: "100日後", 4: "約3年後", 5: "約30年後"},
                        "en": {1: "Tonight", 2: "10 Days Later", 3: "100 Days Later", 4: "Approx. 3 Years", 5: "Approx. 30 Years"},
                        "ko": {1: "오늘 밤", 2: "10일 후", 3: "100일 후", 4: "약 3년 후", 5: "약 30년 후"}
                    }
                    lang_key = locale if locale in SCALE_MAP else "ja"

                    for idx, c in enumerate(parsed["cuts"]):
                        p_num = c.get("panel_number", idx + 1)
                        c["scale_label"] = SCALE_MAP[lang_key].get(p_num, c.get("scale_label"))
                        c["timeframe"] = TIMEFRAME_MAP[lang_key].get(p_num, c.get("timeframe"))
                        c["image_url"] = None

                        # 일본어 모드에서 한국어 잔여 텍스트 방어 치환
                        if lang_key == "ja":
                            if "컷 소제목" in str(c.get("title", "")):
                                default_titles = {1: "決断の瞬間", 2: "最初の試練", 3: "習慣の転換", 4: "複利の結実", 5: "自由な未来"}
                                c["title"] = default_titles.get(p_num, "人生の選択")

                    # 이미지 생성기 활성화 여부 확인
                    enable_img = os.environ.get("ENABLE_IMAGE_GENERATION", "false").lower() in ("true", "1", "yes")
                    parsed["image_generation_enabled"] = enable_img
                    if enable_img:
                        try:
                            cut1 = parsed["cuts"][0]
                            logger.info("Auto-generating panel 1 image with gemini-3.1-flash-image...")
                            res1 = self.generate_panel_image_with_interactions(
                                scene_description=cut1.get("scene_description", raw_input),
                                panel_num=1
                            )
                            if res1.get("status") == "ok" and res1.get("image_url"):
                                cut1["image_url"] = res1["image_url"]
                                logger.info(f"Auto-generated panel 1 image: {res1['image_url']}")
                        except Exception as img_err:
                            logger.warning(f"Failed to auto-generate panel 1 image: {img_err}")
                    else:
                        logger.info("Skipping panel 1 image auto-generation (Image Generator is OFF).")

                    logger.info(f"Generated 5-cut comic using Gemini model [{model}]")
                    return parsed
            except Exception as me:
                last_error = me
                logger.warning(f"Comic generation failed with model {model}: {me}")
                continue

        raise RuntimeError(f"5컷 웹툰 생성 실패 (모든 Gemini 모델 응답 불가): {last_error}")
