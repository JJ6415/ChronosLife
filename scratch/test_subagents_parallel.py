import os
import time
import asyncio
from dotenv import load_dotenv
load_dotenv('backend/.env')
from google import genai

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

def run_subagent(name: str, prompt: str):
    t0 = time.time()
    res = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )
    print(f"[{name}] completed in {time.time()-t0:.2f}s")
    return res.text

async def main():
    t_start = time.time()
    f_prompt = "You are Finance SubAgent. Give a 1-sentence verdict on spending 80,000 KRW against a 50,000 KRW daily budget."
    c_prompt = "You are Career SubAgent. Give a 1-sentence verdict on working 70 hours a week for a career."
    w_prompt = "You are Wellbeing SubAgent. Give a 1-sentence verdict on sleeping 5 hours a night."
    
    tasks = [
        asyncio.to_thread(run_subagent, "FinanceSubAgent", f_prompt),
        asyncio.to_thread(run_subagent, "CareerSubAgent", c_prompt),
        asyncio.to_thread(run_subagent, "WellbeingSubAgent", w_prompt)
    ]
    results = await asyncio.gather(*tasks)
    print(f"Total parallel execution time: {time.time()-t_start:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())
