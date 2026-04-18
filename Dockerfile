FROM python:3.11-slim

# Install necessary build tools and Polars dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pin dependencies and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Ensure the runner script is executable
RUN chmod +x run.sh

# The benchmark runner will execute this script
ENTRYPOINT ["/app/run.sh"]
