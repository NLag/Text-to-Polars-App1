#!/usr/bin/env bash
# Entrypoint for PolarsBench execution

set -euo pipefail

# In a controlled benchmark environment, dependencies should already be installed via Docker.
# python3 -m pip install -r requirements.txt > /dev/null 2>&1

python3 main.py "$@"
