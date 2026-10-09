#!/bin/bash
# ADGRID Cloud — one-command restore for the dev server (port 3000)
# Usage: bash /home/z/my-project/Adgrids/start-adgrid.sh
set -e
cd /home/z/my-project/Adgrids

# 1. env file (recreate if a container recycle wiped it)
if [ ! -f .env ]; then
cat > .env <<'EOF'
JWT_ACCESS_SECRET="dev-access-secret-1f4b9c8e2a7d6f35b0c9e8a1d4f7b2c6"
JWT_REFRESH_SECRET="dev-refresh-secret-9e2c5a8f1b4d7e0a3c6f9b2d5e8a1c4f"
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="7d"
APP_URL="http://localhost:3000"
NODE_ENV="development"
STORAGE_DRIVER="local"
LOCAL_STORAGE_PATH="./uploads"
EOF
echo "[start] recreated .env"
fi

# 2. dependencies (skip if present)
[ -d node_modules ] || npm install --no-audit --no-fund

# 3. database (regenerate client + push schema if db missing)
npx prisma generate >/dev/null 2>&1 || node ./node_modules/prisma/build/index.js generate
[ -f prisma/dev.db ] || node ./node_modules/prisma/build/index.js db push

# 4. kill any stale server on :3000, then start
pkill -f "tsx/dist/cli.mjs server.ts" 2>/dev/null || true
sleep 1
nohup npm run dev > dev-server.log 2>&1 &
sleep 4
curl -s http://localhost:3000/api/health && echo && echo "[start] ADGRID Cloud is UP on http://localhost:3000 (log: dev-server.log)"
