import json
import sys
import os

from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    tables: dict

class ChatResponse(BaseModel):
    response: str

def strip_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```python"):
        text = text[len("```python"):].strip()
    elif text.startswith("```"):
        text = text[len("```"):].strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required.")

    client = genai.Client(api_key=api_key)
    model_id = 'gemini-2.5-pro'

    system_instruction = (
        "Return only valid Python Polars code. "
        "No markdown fences. "
        "Assign the final Polars DataFrame to result. "
        f"Available datasets: {json.dumps(payload.tables, ensure_ascii=False)}"
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.0,
        top_p=0.95,
        top_k=40,
        max_output_tokens=4096,
    )

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=payload.message,
            config=config
        )
        
        result_code = strip_code_fence(response.text)
        return ChatResponse(response=result_code)
    except Exception as e:
        print(f"Agent Generation Error: {e}", file=sys.stderr)
        return ChatResponse(response="")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

