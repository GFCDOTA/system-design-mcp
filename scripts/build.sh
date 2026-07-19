#!/usr/bin/env bash
# Build the static frontend bundle (o app é 100% estático — sem backend).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Frontend: npm run build =="
( cd "$DIR/frontend" && npm install --no-fund --no-audit && npm run build )

echo "== Artifacts =="
echo "frontend bundle: $DIR/frontend/dist"
echo "(deploy enxuto: cd frontend && npm run build:deploy -> dist-deploy/)"
