#!/bin/bash
set -eu

OXLINT_JSON=/tmp/oxlint-full.json
ESLINT_JSON=/tmp/eslint-full.json

if [[ "${1:-}" == "--fresh" ]]; then
    rm -f "$OXLINT_JSON" "$ESLINT_JSON" "$OXLINT_JSON.time" "$ESLINT_JSON.time"
fi

if [[ -s "$OXLINT_JSON" ]]; then
    echo "Reusing $OXLINT_JSON (pass --fresh to regenerate)"
else
    echo "Running oxlint (full repo, type-aware)..."
    # Through the pipeline, not `npx oxlint`: both legs have to pass the same processors or the
    # react-hooks rows compare a filtered report against an unfiltered one.
    # Seatbelt off: its grandfathered debt is what this comparison measures.
    SECONDS=0
    SEATBELT_DISABLE=1 \
        bun "$(dirname "$0")/../scripts/lint/index.ts" --linter=oxlint --format=json . \
        >"$OXLINT_JSON" || true
    echo "$SECONDS" >"$OXLINT_JSON.time"
fi

if [[ -s "$ESLINT_JSON" ]]; then
    echo "Reusing $ESLINT_JSON (pass --fresh to regenerate)"
else
    echo "Running ESLint (full repo, ~10 min)..."
    # 16 GB heap + capped concurrency: with ESLINT_CONCURRENCY=auto the ESLint workers OOM
    # (ERR_WORKER_OUT_OF_MEMORY) even on a 48 GB machine.
    # Seatbelt off: its grandfathered debt is what this comparison measures.
    SECONDS=0
    SEATBELT_DISABLE=1 NODE_OPTIONS=--max_old_space_size=16384 ESLINT_CONCURRENCY=2 \
        bun "$(dirname "$0")/../scripts/lint/index.ts" --linter=eslint --format=json --no-cache . \
        >"$ESLINT_JSON" || true
    echo "$SECONDS" >"$ESLINT_JSON.time"
fi

echo
python3 "$(dirname "$0")/compareFullRepo.py" "$OXLINT_JSON" "$ESLINT_JSON"
