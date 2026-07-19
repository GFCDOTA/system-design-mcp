#!/usr/bin/env bash
# Run the full test suite: frontend unit/contract tests (inclui a integridade
# da knowledge-base — kb-integrity.test.mjs) + type-check/build estrito.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Frontend: npm test (unit + kb-integrity) =="
( cd "$DIR/frontend" && npm install --no-fund --no-audit && npm test )

echo "== Frontend: type-check + build =="
( cd "$DIR/frontend" && npm run build )

echo "== OK =="
