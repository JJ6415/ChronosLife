# ============================================
# ChronosLife: Unified Dockerfile for Cloud Run
# Multi-stage build: Frontend (Next.js) + Backend (FastAPI)
# ============================================

# ── Stage 1: Build Next.js Frontend ──────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit

COPY frontend/ ./
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# ── Stage 2: Python Backend + Static Frontend ───────────
FROM python:3.11-slim AS production

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY .env.example ./.env

# Copy Next.js standalone build
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Startup script
COPY <<'EOF' /app/start.sh
#!/bin/bash
set -e

# Start FastAPI backend on port 8080
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!

# Start Next.js frontend on port 3000
cd /app/frontend
PORT=3000 HOSTNAME=0.0.0.0 node server.js &
FRONTEND_PID=$!

echo "🚀 ChronosLife is running!"
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:3000"

# Wait for either process to exit
wait -n $BACKEND_PID $FRONTEND_PID
EOF

RUN chmod +x /app/start.sh

EXPOSE 8080 3000

CMD ["/app/start.sh"]
