# PolarsBench Submission: Text-to-Polars Agent (Gemini 2.5 Pro)

This repository serves as a self-contained, reproducible submission for [PolarsBench](https://polarsbench.net/). It defines a `text -> Polars` agent driven by Google's latest Gemini 2.5 Pro model.

## Overview

The goal is to automatically yield valid, optimal Polars code (`python`) based on a natural language task description and an optional dataset schema.

### Key Requirements Satisfied

- **Reproducible**: Dependencies (`google-genai`, `polars`) are explicitly pinned in `requirements.txt` and the Dockerfile.
- **Self-contained**: All logic, configuration, and invocation patterns required to run are bundled here.
- **Non-interactive**: Execution is fully automated without user-prompting via CLI arguments or JSON configuration payloads.
- **Runner-friendly**: `run.sh` provides the standard entry point, returning the output cleanly mapped via `stdout`. Errors are correctly routed to `stderr` with informative logs.
- **Deterministic**: The LLM configuration explicitly sets `temperature=0.0`.

## Quickstart

### Environment variables

Before executing, ensure your Gemini API Key is loaded in the environment:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

### Running Locally

```bash
# 1. Install Dependencies
pip install -r requirements.txt

# 2. Run the agent directly
python3 main.py --prompt "Calculate the average 'salary' grouped by 'department'."

# 3. Supplying Schema Context
python3 main.py --prompt "Find the top 5 longest trips." --schema "{ \"columns\": [\"trip_id\", \"duration_seconds\"] }"
```

### Docker / Automated Environments

A complete `Dockerfile` is provided for containerized evaluation.

```bash
docker build -t polarsbench-agent .
docker run --env GEMINI_API_KEY=$GEMINI_API_KEY polarsbench-agent --prompt "calculate avg salary by department"
```

## Structure

*   `main.py`: CLI driver.
*   `agent.py`: Google GenAI API logic with deterministic settings and specific system prompting rules.
*   `run.sh`: Convenient execution wrapper.
*   `Dockerfile`: Standard runtime environment builder.
*   `requirements.txt`: Pinned dependencies.

---
*Created via Google AI Studio.*
