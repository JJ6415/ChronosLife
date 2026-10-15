import asyncio
import os
import base64
from dotenv import load_dotenv

load_dotenv('backend/.env')
from google import genai
from google.genai import types

async def test_live_session():
    client = genai.Client()
    model = "gemini-3.8-live"
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        system_instruction=types.Content(parts=[types.Part.from_text(
            text="당신은 ChronosLife의 수석 인생 헌법 설계관입니다. 사용자와 한국어로 짧고 명료하게 대화하세요."
        )])
    )
    
    print("Connecting to gemini-3.8-live...")
    async with client.aio.live.connect(model=model, config=config) as session:
        print("Live Session connected successfully!")
        
        # 1. 텍스트 실시간 전송
        print("Sending message...")
        await session.send_realtime_input(text="안녕하세요! 저는 주말 러닝 4시간을 사수하고 싶습니다.")
        
        # 2. 수신 루프 테스트
        audio_chunk_count = 0
        total_audio_bytes = 0
        
        async for response in session.receive():
            server_content = response.server_content
            if server_content and server_content.model_turn:
                for part in server_content.model_turn.parts:
                    if part.inline_data:
                        audio_data = part.inline_data.data
                        audio_chunk_count += 1
                        total_audio_bytes += len(audio_data) if audio_data else 0
                        print(f"Received audio chunk {audio_chunk_count} (size: {len(audio_data) if audio_data else 0} bytes)")
                        if audio_chunk_count >= 3:
                            print(f"Total {audio_chunk_count} audio chunks ({total_audio_bytes} bytes) received!")
                            return True
            
            if response.tool_call:
                print("Tool call received:", response.tool_call)

if __name__ == '__main__':
    asyncio.run(test_live_session())
