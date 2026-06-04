# --- Single image that runs both Next.js (Node) and the ML model (Python) ---
FROM node:22-bookworm-slim

# Install Python 3 + pip so the inventory predict route can run ml_models/inference.py.
# `python-is-python3` makes the `python` command (used by spawn('python')) available.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python ML dependencies (versions pinned to match the trained model).
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node dependencies first (better build caching).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app (including ml_models/ with the .pkl).
COPY . .

# Build the Next.js production bundle.
RUN npm run build

ENV NODE_ENV=production

# Render injects $PORT; Next.js must listen on it and bind to 0.0.0.0.
EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}"]
