# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build Next.js (standalone output)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS node-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# OpenSSL required by Prisma client at build time
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npx prisma generate
RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production image — Python 3.11 + Node.js + supervisord
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runner
WORKDIR /app

# System deps: Node.js 20, supervisord, ffmpeg (audio encoding), libsndfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    supervisor \
    ffmpeg \
    libsndfile1 \
    libgomp1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ───────────────────────────────────────────────────────
COPY python/requirements.txt ./python/
RUN pip install --no-cache-dir -r ./python/requirements.txt

# ── Python app ────────────────────────────────────────────────────────────────
COPY python/ ./python/

# ── Next.js standalone bundle ─────────────────────────────────────────────────
# The standalone dir contains server.js + node_modules needed at runtime
COPY --from=node-builder /app/.next/standalone ./
# Static assets and public folder must sit inside standalone/
COPY --from=node-builder /app/.next/static  ./.next/static
COPY --from=node-builder /app/public        ./public

# ── Prisma (client + CLI needed at runtime for db push) ──────────────────────
COPY prisma ./prisma
COPY --from=node-builder /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=node-builder /app/node_modules/@prisma  ./node_modules/@prisma
COPY --from=node-builder /app/node_modules/prisma   ./node_modules/prisma

# ── Supervisord config ────────────────────────────────────────────────────────
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ── Startup script (runs prisma db push, then supervisord) ────────────────────
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# ── Persistent storage dir (overridden by volume at /app/uploads) ─────────────
RUN mkdir -p /app/uploads/masters

EXPOSE 3000

# start.sh: runs prisma db push, then starts supervisord
CMD ["./start.sh"]
