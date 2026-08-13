#!/bin/bash
#
# Full-repository ESLint vs Oxlint comparison (see OXLINT_MIGRATION_INVESTIGATION.md).
#
# Runs both linters over the whole repo, saves JSON reports, then prints the
# per-rule comparison table via oxlint-migration/compareFullRepo.py.
#
# Existing reports are reused (the ESLint run takes ~10 min). Pass --fresh to
# force regeneration of both.
#
# Usage:
#   npm run compare-oxlint            # reuse cached reports if present
#   npm run compare-oxlint -- --fresh # regenerate both reports
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
    # oxlint exits non-zero when it finds errors — the report is still complete
    SECONDS=0
    npx oxlint --type-aware --format json >"$OXLINT_JSON" 2>/dev/null || true
    echo "$SECONDS" >"$OXLINT_JSON.time"
fi

if [[ -s "$ESLINT_JSON" ]]; then
    echo "Reusing $ESLINT_JSON (pass --fresh to regenerate)"
else
    echo "Running ESLint (full repo, ~10 min)..."
    # 16 GB heap + capped concurrency: with --concurrency=auto the workers OOM
    # (ERR_WORKER_OUT_OF_MEMORY) even on a 48 GB machine
    # SEATBELT_DISABLE=1: turn off the seatbelt debt suppression so the ~4800
    # grandfathered findings are visible — that's what we compare against
    # --rule '{"progress/activate":"off"}': eslint-plugin-file-progress writes its spinner
    # to stderr, which sprays one "Processing: <file>" line per file (8200 of them) plus a
    # "Lint done." per worker into this script's output. Switching the rule off is better
    # than redirecting stderr, which would also swallow real errors. Verified: the report
    # is byte-identical with and without.
    SECONDS=0
    SEATBELT_DISABLE=1 NODE_OPTIONS=--max_old_space_size=16384 npx eslint . \
        --no-cache --concurrency=2 --no-warn-ignored \
        --rule '{"progress/activate":"off"}' \
        --format json -o "$ESLINT_JSON" || true
    echo "$SECONDS" >"$ESLINT_JSON.time"
fi

echo
python3 "$(dirname "$0")/compareFullRepo.py" "$OXLINT_JSON" "$ESLINT_JSON"
