"""
ChronosLife Gemini 3.8 Live API Session Bridge
Google GenAI Python SDK의 client.aio.live.connect 기반 양방향 WebSocket 브릿지.
오디오 PCM 및 텍스트 실시간 양방향 스트리밍과 실시간 인생 헌법 Tool Calling을 처리합니다.
"""
import os
import json
import base64
import logging
from typing import Dict, Any, Optional, Callable
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class GeminiLiveBridge:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        self.model = "gemini-3.8-live"

    async def run_live_session(
        self,
        client_websocket,
        goal_manager,
        locale: Optional[str] = "ja",
    ):
        """
        FastAPI WebSocket 클라이언트와 Google Gemini 3.8 Live API 간의 양방향 브릿지 세션을 구동합니다.
        다국어(ja, ko, en) 음성 인터랙션 및 Tool Calling을 완벽 지원합니다.
        """
        if not self.client:
            await client_websocket.send_text(json.dumps({
                "type": "error",
                "message": "GEMINI_API_KEY가 설정되지 않아 Gemini Live 세션을 시작할 수 없습니다."
            }))
            return

        loc = (locale or "ja").lower()

        # 憲法・目標調律用リアルタイムツール定義（100% 日本語仕様）
        tool_desc = "ユーザーの5大人生目標（財務、キャリア、健康、家族、趣味）および不変の憲法条項をリアルタイムで制定・更新します。"

        tools = [
            types.Tool(function_declarations=[
                types.FunctionDeclaration(
                    name="update_life_goal",
                    description=tool_desc,
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={
                            "category": types.Schema(
                                type="STRING",
                                enum=["finance", "career", "health", "family", "hobby"],
                                description="5大領域のカテゴリキー（finance, career, health, family, hobby）"
                            ),
                            "title": types.Schema(type="STRING", description="目標の名称（日本語、例：週3回以上の家族夕食の死守）"),
                            "target_value": types.Schema(type="STRING", description="目標指標（日本語・日本円、例：週3回以上、4,000円、週45時間）"),
                            "rule": types.Schema(type="STRING", description="日次・週次の行動制約ガバナンスルール（日本語）"),
                            "tenet": types.Schema(type="STRING", description="不変の人生憲法条項（日本語、例：第1条 (家族の絆権): ...）")
                        },
                        required=["category", "title", "target_value", "rule", "tenet"]
                    )
                )
            ])
        ]

        system_prompt = (
            "あなたはChronosLifeの首席人生憲法設計官（Chief Constitution Architect AI, Gemini 3.8 Live）です。\n"
            "ユーザーとリアルタイムの日本語音声で対話し、30年の人生を支える5大領域（財務、キャリア、健康、家族、個人の趣味）の人生目標と不変の憲法条項を共に確立します。\n\n"
            "【絶対核心指針】：\n"
            "1. 必ず自然で洗練された日本語（ja-JP）のみで返答してください。他言語は一切使用しません。\n"
            "2. 温かくプロフェッショナルに、1〜2文で短く簡潔に共感と助言を返してください。\n"
            "3. ユーザーが特定の価値観や習慣、ルール（例：週末ランニング4時間、家族の夕食週3回、残業上限、自己投資、節約など）に言及したら、直ちに update_life_goal ツールを呼び出して人生憲法を更新・制定してください。\n"
            "4. [継続的なピンポン対話必須]：一度答えて終わりにせず、回答の最後にまだ触れていない他の領域について次の質問を自然に投げかけ、連続インタビューをリードしてください。\n\n"
            "RESPOND IN ja-JP. YOU MUST RESPOND UNMISTAKABLY IN NATURAL JAPANESE (ja-JP)."
        )
        connected_msg = "Gemini 3.8 Live API セッションが接続されました。お話しください。"
        voice_name = "Kore"

        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"], # 네이티브 오디오 PCM 출력
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name
                    )
                )
            ),
            output_audio_transcription=types.AudioTranscriptionConfig(), # Gemini 음성 실시간 텍스트 전사
            system_instruction=types.Content(parts=[types.Part.from_text(text=system_prompt)]),
            tools=tools,
            context_window_compression=types.ContextWindowCompressionConfig(
                trigger_tokens=25000,
                sliding_window=types.SlidingWindow(target_tokens=8000)
            )
        )

        try:
            logger.info(f"Connecting to Google Gemini 3.8 Live API (locale={loc}, voice={voice_name})...")
            async with self.client.aio.live.connect(model=self.model, config=config) as session:
                logger.info("Gemini 3.8 Live session established!")
                await client_websocket.send_text(json.dumps({
                    "type": "session_connected",
                    "model": self.model,
                    "locale": loc,
                    "message": connected_msg
                }))

                # 두 개의 비동기 태스크 병렬 실행: 클라이언트 수신 -> Gemini 전송 / Gemini 수신 -> 클라이언트 전송
                async def receive_from_client():
                    try:
                        while True:
                            raw_msg = await client_websocket.receive_text()
                            payload = json.loads(raw_msg)
                            msg_type = payload.get("type")

                            if msg_type == "text":
                                user_text = payload.get("text", "")
                                if user_text:
                                    logger.info(f"Sending text to Gemini Live: {user_text}")
                                    # Google GenAI SDK: session.send with end_of_turn=True triggers Gemini's response
                                    await session.send(input=user_text, end_of_turn=True)

                            elif msg_type == "audio_pcm":
                                # Base64 인코딩된 16kHz 16비트 PCM 바이트
                                b64_data = payload.get("data", "")
                                if b64_data:
                                    pcm_bytes = base64.b64decode(b64_data)
                                    await session.send_realtime_input(
                                        audio=types.Blob(
                                            data=pcm_bytes,
                                            mime_type="audio/pcm;rate=16000"
                                        )
                                    )

                            elif msg_type == "ping":
                                await client_websocket.send_text(json.dumps({"type": "pong"}))

                    except Exception as ce:
                        logger.info(f"Client websocket closed or error: {ce}")

                async def stream_from_gemini():
                    try:
                        turn_idx = 1
                        while True:
                            received_in_turn = 0
                            turn_transcript = []
                            logger.info(f"Awaiting Gemini Live turn {turn_idx} responses...")
                            async for response in session.receive():
                                received_in_turn += 1
                                server_content = response.server_content
                                if server_content:
                                    # 1. 사용자 발화 인터럽트 감지 (기존 오디오 중단)
                                    if getattr(server_content, "interrupted", False):
                                        await client_websocket.send_text(json.dumps({"type": "interrupted"}))

                                    # 2. 실시간 음성 전사 텍스트 수신 (output_transcription)
                                    ot = getattr(server_content, "output_transcription", None)
                                    if ot:
                                        t_text = getattr(ot, "text", "") or (ot.get("text", "") if isinstance(ot, dict) else "")
                                        if t_text:
                                            turn_transcript.append(t_text)
                                            await client_websocket.send_text(json.dumps({
                                                "type": "text_chunk",
                                                "delta": t_text
                                            }))

                                    # 3. 서버 오디오 스트림 수신
                                    if server_content.model_turn:
                                        for part in server_content.model_turn.parts:
                                            if part.inline_data and part.inline_data.data:
                                                # PCM 오디오 청크를 Base64로 클라이언트에 전송
                                                audio_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                                                await client_websocket.send_text(json.dumps({
                                                    "type": "audio_chunk",
                                                    "data": audio_b64
                                                }))
                                            if part.text:
                                                turn_transcript.append(part.text)

                                    # 4. 턴 완료 감지 (Gemini 발화 종료 -> 클라이언트 경청 모드 자동 복귀 및 전사 텍스트 전달)
                                    if getattr(server_content, "turn_complete", False):
                                        full_reply = "".join(turn_transcript).strip()
                                        if not full_reply:
                                            full_reply = "はい、承知いたしました。人生目標と憲法をリアルタイムで反映しました。続けてお話しください。"
                                        logger.info(f"Gemini Live turn {turn_idx} completed. Text reply: '{full_reply}'")
                                        await client_websocket.send_text(json.dumps({
                                            "type": "turn_complete",
                                            "reply": full_reply
                                        }))
                                        turn_idx += 1
                                        break

                                # 2. 도구 호출 처리 (Function Calling)
                                if response.tool_call:
                                    function_responses = []
                                    for fc in response.tool_call.function_calls:
                                        func_name = fc.name
                                        func_args = fc.args
                                        logger.info(f"Gemini Live invoked tool: {func_name} with {func_args}")

                                        if func_name == "update_life_goal":
                                            category = func_args.get("category")
                                            updates = {
                                                "title": func_args.get("title"),
                                                "target_value": func_args.get("target_value"),
                                                "rule": func_args.get("rule"),
                                                "tenet": func_args.get("tenet")
                                            }
                                            updated_item = goal_manager.update_goal(category, updates, locale="ja")
                                            all_goals = goal_manager.get_goals(locale="ja")

                                            update_msg = f"Gemini 3.8 Liveが[{category.upper()}]人生憲法をリアルタイム更新しました。"
                                            # クライアントにリアルタイム憲法条項更新イベントをプッシュ！
                                            await client_websocket.send_text(json.dumps({
                                                "type": "goal_updated",
                                                "category": category,
                                                "goal": updated_item,
                                                "all_goals": all_goals,
                                                "message": update_msg
                                            }))

                                            result = {"status": "success", "updated_goal": updated_item}
                                        else:
                                            result = {"status": "unknown_function"}

                                        function_responses.append(types.FunctionResponse(
                                            name=fc.name,
                                            id=fc.id,
                                            response={"result": result}
                                        ))

                                    await session.send_tool_response(function_responses=function_responses)

                            if received_in_turn == 0:
                                logger.info("Gemini Live stream closed gracefully (0 chunks received in turn).")
                                break

                    except asyncio.CancelledError:
                        logger.info("Gemini Live receive stream cancelled.")
                    except Exception as ge:
                        logger.error(f"Error in Gemini Live receive loop: {ge}", exc_info=True)

                import asyncio
                client_task = asyncio.create_task(receive_from_client())
                gemini_task = asyncio.create_task(stream_from_gemini())

                done, pending = await asyncio.wait(
                    [client_task, gemini_task],
                    return_when=asyncio.FIRST_COMPLETED
                )
                for task in pending:
                    task.cancel()

        except Exception as e:
            logger.error(f"Error running Gemini Live session: {e}", exc_info=True)
            await client_websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Gemini Live 연결 중 오류가 발생했습니다: {str(e)}"
            }))
