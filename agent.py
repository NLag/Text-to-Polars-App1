import os
import sys
from google import genai
from google.genai import types

class PolarsAgent:
    def __init__(self):
        # PolarsBench evaluation environments inject GEMINI_API_KEY
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required.")
            
        self.client = genai.Client(api_key=api_key)
        # Pin the model version as recommended for reproducible benchmarks
        self.model_id = 'gemini-2.5-pro'

        self.system_instruction = """You are an expert Data Engineer specializing in Python and the `polars` library.
Your task is to take a natural language query and dataset schema, and generate highly optimized, correct Polars code.

Rules:
1. Always assume polars is available as `pl`. Import it if necessary.
2. Assume the initial dataframe(s) are already loaded as specified in the schema/prompt.
3. Output ONLY valid, executable Python code.
4. Do NOT output markdown code blocks (e.g. ```python ... ```). Only raw text code.
5. Be deterministic and use idiomatic Polars (e.g., Expression API `pl.col()`, avoid pandas-like `.apply()`).
6. Do not include any explanations, print statements, or conversational text."""

    def generate(self, prompt: str, schema: str = "") -> str:
        full_prompt = f"Natural Language Query:\n{prompt}\n\n"
        if schema:
            full_prompt += f"Dataset Context & Schema:\n{schema}\n"

        # Deterministic parameters for reproducible benchmarks
        config = types.GenerateContentConfig(
            system_instruction=self.system_instruction,
            temperature=0.0, # CRITICAL for PolarsBench reproduciblity
            top_p=0.95,
            top_k=40,
            max_output_tokens=4096,
        )

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=full_prompt,
                config=config
            )

            code = response.text.strip()
            
            # Post-process to remove Markdown formatting if the model slipped up
            if code.startswith("```python"):
                code = code[9:]
            elif code.startswith("```"):
                code = code[3:]
            
            if code.endswith("```"):
                code = code[:-3]
                
            return code.strip()

        except Exception as e:
            print(f"Agent Generation Error: {e}", file=sys.stderr)
            sys.exit(1)
