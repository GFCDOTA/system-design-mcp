#!/usr/bin/env bash
# Start the frontend dev server (:5173). O app é 100% estático — sem backend.
# --host expõe na LAN (iPhone). No Windows há launcher: SUBIR-SYSTEM-DESIGN.cmd.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Starting frontend on :5173 =="
( cd "$DIR/frontend" && npm install --no-fund --no-audit && npm run dev -- --host )
