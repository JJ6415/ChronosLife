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
    ):
        """
        FastAPI WebSocket 클라이언트와 Google Gemini 3.8 Live API 간의 양방향 브릿지 세션을 구동합니다.
        """
        if not self.client:
            await client_websocket.send_text(json.dumps({
                "type": "error",
                "message": "GEMINI_API_KEY가 설정되지 않아 Gemini Live 세션을 시작할 수 없습니다."
            }))
            return

        # 헌법 및 목표 조율용 실시간 도구 정의
        tools = [
            types.Tool(function_declarations=[
                types.FunctionDeclaration(
                    name="update_life_goal",
                    description="사용자의 5대 인생 목표(재정, 커리어, 건강, 가족, 취미) 및 불변의 헌법 조항을 실시간 갱신합니다.",
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={
                            "category": types.Schema(
                                type="STRING",
                                enum=["finance", "career", "health", "family", "hobby"],
                                description="5대 카테고리 중 하나"
                            ),
                            "title": types.Schema(type="STRING", description="목표 명칭"),
                            "target_value": types.Schema(type="STRING", description="구체적 목표 수치 (예: 시드 1억, 주 45시간)"),
                            "rule": types.Schema(type="STRING", description="일일/주간 제어 규칙"),
                            "tenet": types.Schema(type="STRING", description="제N조 불변의 헌법 내용")
                        },
                        required=["category", "title", "target_value", "rule", "tenet"]
                    )
                )
            ])
        ]

        system_prompt = (
            "당신은 ChronosLife의 수석 인생 헌법 설계관(Chief Constitution Architect AI, Gemini 3.8 Live)입니다. "
            "사용자와 실시간 한국어 음성으로 대화하며, 30년을 지탱할 5대 도메인(재정, 커리어, 건강, 가족, 취미)의 인생 목표와 불변의 헌법을 확립합니다. "
            "핵심 지침: "
            "1. 한국어로 따뜻하고 프로페셔널하게 1~2문장으로 짧게 요약 답변하세요. "
            "2. 사용자가 특정 가치관이나 규칙(예: 주말 러닝 4시간, 가족 식사 3회, 주 52시간 상한 등)을 언급하면, 반드시 즉시 update_life_goal 도구를 호출하여 헌법을 제정/갱신하세요. "
            "3. [지속적인 핑퐁 대화 필수]: 한 번 답변하고 끝내지 말고, 답변 끝에 다른 도메인(재정, 커리어, 건강, 가족, 취미 중 아직 안 나온 영역)에 대해 다음 질문을 던져서 연속 인터뷰를 활발히 이끌어가세요.\n\n"
            "RESPOND IN ko-KR. YOU MUST RESPOND UNMISTAKABLY IN ko-KR."
        )

        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"], # 네이티브 오디오 PCM 출력
            system_instruction=types.Content(parts=[types.Part.from_text(text=system_prompt)]),
            tools=tools,
            context_window_compression=types.ContextWindowCompressionConfig(
                trigger_tokens=25000,
                sliding_window=types.SlidingWindow(target_tokens=8000)
            )
        )

        try:
            logger.info("Connecting to Google Gemini 3.8 Live API...")
            async with self.client.aio.live.connect(model=self.model, config=config) as session:
                logger.info("Gemini 3.8 Live session established!")
                await client_websocket.send_text(json.dumps({
                    "type": "session_connected",
                    "model": self.model,
                    "message": "Gemini 3.8 Live API 세션이 연결되었습니다. 말씀하세요."
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
                                    await session.send_realtime_input(text=user_text)

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
                            logger.info(f"Awaiting Gemini Live turn {turn_idx} responses...")
                            async for response in session.receive():
                                received_in_turn += 1
                                server_content = response.server_content
                                if server_content:
                                    # 1. 사용자 발화 인터럽트 감지 (기존 오디오 중단)
                                    if getattr(server_content, "interrupted", False):
                                        await client_websocket.send_text(json.dumps({"type": "interrupted"}))

                                    # 2. 서버 오디오 스트림 수신
                                    if server_content.model_turn:
                                        for part in server_content.model_turn.parts:
                                            if part.inline_data and part.inline_data.data:
                                                # PCM 오디오 청크를 Base64로 클라이언트에 전송
                                                audio_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                                                await client_websocket.send_text(json.dumps({
                                                    "type": "audio_chunk",
                                                    "data": audio_b64
                                                }))

                                    # 3. 턴 완료 감지 (Gemini 발화 종료 -> 클라이언트 경청 모드 자동 복귀)
                                    if getattr(server_content, "turn_complete", False):
                                        logger.info(f"Gemini Live turn {turn_idx} completed.")
                                        await client_websocket.send_text(json.dumps({"type": "turn_complete"}))
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
                                            updated_item = goal_manager.update_goal(category, updates)
                                            all_goals = goal_manager.get_goals()

                                            # 클라이언트에 실시간 헌법 조항 갱신 이벤트 푸시!
                                            await client_websocket.send_text(json.dumps({
                                                "type": "goal_updated",
                                                "category": category,
                                                "goal": updated_item,
                                                "all_goals": all_goals,
                                                "message": f"Gemini 3.8 Live가 [{category.upper()}] 헌법을 실시간 갱신했습니다."
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
