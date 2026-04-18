import argparse
import json
import sys
import os
from agent import PolarsAgent

def main():
    parser = argparse.ArgumentParser(description="PolarsBench CLI - Text to Polars Agent")
    parser.add_argument("--prompt", type=str, help="Natural language prompt describing the data transformation")
    parser.add_argument("--schema", type=str, default="", help="Optional JSON schema or context of the data")
    parser.add_argument("--input-json", type=str, help="Path to input JSON containing prompt and context (for runner compatibility)")
    args = parser.parse_args()

    prompt = args.prompt
    schema = args.schema

    # Read from JSON parameter file if provided by the evaluation runner
    if args.input_json:
        if os.path.exists(args.input_json):
            try:
                with open(args.input_json, 'r') as f:
                    data = json.load(f)
                    prompt = prompt or data.get("prompt", "")
                    schema = schema or data.get("schema", "")
            except Exception as e:
                print(f"Error reading input JSON {args.input_json}: {e}", file=sys.stderr)
                sys.exit(1)
        else:
            print(f"Error: Provided input file '{args.input_json}' does not exist.", file=sys.stderr)
            sys.exit(1)

    if not prompt:
        print("Error: No prompt provided. Use --prompt or --input-json.", file=sys.stderr)
        sys.exit(1)

    try:
        agent = PolarsAgent()
        code = agent.generate(prompt, schema)
        
        # The runner extracts stdout, so print ONLY the resulting code output.
        print(code)
    except Exception as e:
        print(f"Error executing agent: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
