# --- Single image that runs both Next.js (Node) and the ML model (Python) ---
FROM node:22-bookworm-slim

# Install Python 3 + pip so the inventory predict route can run ml_models/inference.py.
# `python-is-python3` makes the `python` command (used by spawn('python')) available.
# python3/pip to run the model; libgomp1 is the OpenMP runtime LightGBM needs.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python-is-python3 libgomp1 \
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

# `next build` evaluates the auth route + lib/mongodb.ts at build time, which
# require these vars to merely EXIST (no real connection is made during build).
# These placeholders only satisfy the build; Render's real environment variables
# override all of them at runtime.
ENV NEXTAUTH_URL=https://placeholder.onrender.com
ENV NEXTAUTH_SECRET=build-time-placeholder-secret
ENV MONGODB_URI=mongodb://placeholder:27017/placeholder

# Build the Next.js production bundle.
RUN npm run build

ENV NODE_ENV=production

# Render injects $PORT; Next.js must listen on it and bind to 0.0.0.0.
EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}"]
