#!/bin/bash
set -eu

OXLINT_JSON=/tmp/oxlint-full.json
ESLINT_JSON=/tmp/eslint-full.json

if [[ "${1:-}" == "--fresh" ]]; then
    rm -f "$OXLINT_JSON" "$ESLINT_JSON" "$ESLINT_JSON.raw" "$OXLINT_JSON.time" "$ESLINT_JSON.time"
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
    # eslint-plugin-file-progress writes its spinner to stderr, one line per file; switching the
    # rule off beats redirecting stderr, which would swallow real errors too.
    # The report then goes through applyLintProcessors.ts, because the React Compiler suppression and
    # the no-deprecated stratification are pipeline stages now rather than ESLint processors, so raw
    # ESLint reports findings the repo's gate does not. Seatbelt is the one stage left out, on
    # purpose: its grandfathered debt is what this compares against. That is also why no
    # SEATBELT_DISABLE=1 is set any more -- seatbelt is no longer an ESLint plugin, so the variable
    # had nothing to switch off here; scripts/lint/processors/Seatbelt.ts reads it, and the bridge
    # does not run that stage.
    SECONDS=0
    NODE_OPTIONS=--max_old_space_size=16384 npx eslint . \
        --no-cache --concurrency=2 --no-warn-ignored \
        --rule '{"progress/activate":"off"}' \
        --format json -o "$ESLINT_JSON.raw" || true
    bun "$(dirname "$0")/applyLintProcessors.ts" --in "$ESLINT_JSON.raw" --out "$ESLINT_JSON"
    echo "$SECONDS" >"$ESLINT_JSON.time"
fi

echo
python3 "$(dirname "$0")/compareFullRepo.py" "$OXLINT_JSON" "$ESLINT_JSON"
