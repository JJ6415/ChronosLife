import asyncio
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
from google import genai

async def test():
    client = genai.Client()
    models = ['gemini-2.0-flash-exp', 'gemini-2.0-flash-realtime-exp', 'gemini-2.5-flash', 'gemini-3.8-live', 'gemini-3.5-flash-lite']
    for m in models:
        try:
            print(f'Testing live.connect with {m}...')
            async with client.aio.live.connect(model=m, config={'response_modalities': ['AUDIO']}) as session:
                print(f'Successfully connected with {m}!')
                await session.send_realtime_input(text='안녕하세요')
                async for resp in session.receive():
                    print(f'Received response from {m}:', resp)
                    break
                print(f'Model {m} works perfectly!')
                return m
        except Exception as e:
            print(f'Failed {m}: {e}')

if __name__ == '__main__':
    asyncio.run(test())
