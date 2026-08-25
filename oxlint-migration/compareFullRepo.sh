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
    # oxlint exits non-zero when it finds errors, and the report is still complete
    SECONDS=0
    npx oxlint --type-aware --format json >"$OXLINT_JSON" 2>/dev/null || true
    echo "$SECONDS" >"$OXLINT_JSON.time"
fi

if [[ -s "$ESLINT_JSON" ]]; then
    echo "Reusing $ESLINT_JSON (pass --fresh to regenerate)"
else
    echo "Running ESLint (full repo, ~10 min)..."
    # 16 GB heap + capped concurrency: with --concurrency=auto the ESLint workers OOM
    # (ERR_WORKER_OUT_OF_MEMORY) even on a 48 GB machine.
    # SEATBELT_DISABLE=1 turns off the seatbelt debt suppression, so the grandfathered findings
    # are visible, which is what this compares against.
    # eslint-plugin-file-progress writes its spinner to stderr, one line per file; switching the
    # rule off beats redirecting stderr, which would swallow real errors too.
    SECONDS=0
    SEATBELT_DISABLE=1 NODE_OPTIONS=--max_old_space_size=16384 npx eslint . \
        --no-cache --concurrency=2 --no-warn-ignored \
        --rule '{"progress/activate":"off"}' \
        --format json -o "$ESLINT_JSON" || true
    echo "$SECONDS" >"$ESLINT_JSON.time"
fi

echo
python3 "$(dirname "$0")/compareFullRepo.py" "$OXLINT_JSON" "$ESLINT_JSON"
