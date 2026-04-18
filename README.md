# PolarsBench API Submission - Gemini 2.5 Pro

This repository structures a PolarsBench-compatible submission as a FastAPI application, modeled closely after the official PolarsBench text-to-Polars evaluation requirements.

## Architecture & Layout
- `pyproject.toml` — Standard python dependency specification and project metadata matching the runner requirements.
- `main.py` — A FastAPI application implementing the mandatory `/` healthcheck and `/chat` web endpoints for the PolarsBench evaluator.
- `requirements.txt` — Frozen environment details (also resolvable natively via pyproject dependencies).

## How it works

The `/chat` route takes the following `POST` payload:
```json
{
  "message": "Group by department and calc average salary",
  "tables": {"department": "str", "salary": "float", "employee_id": "int"}
}
```

It queries Google's `gemini-2.5-pro` using deterministic evaluation bounds (`temperature=0.0`) and returns pure Polars code, formatted as:
```json
{
  "response": "result = pl.col('department')  # (example valid code)"
}
```

## Running the API locally

Ensure `GEMINI_API_KEY` is present in your environment variables:

```bash
export GEMINI_API_KEY="your-api-key"
```

Start the standard ASGI server:
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```
