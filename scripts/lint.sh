#!/bin/bash

# Run ESLint with the repo's standard flags (memory ceiling, shared content
# cache, auto concurrency). Delegate target selection to the caller:
#
#   ./scripts/lint.sh                 -> lint the whole repo
#   ./scripts/lint.sh src/foo.ts ...  -> lint just the given paths

set -euo pipefail

# parse args
USE_CACHE=true
for ARG in "$@"; do
    if [[ "$ARG" == "--no-cache" ]]; then
        USE_CACHE=false
        break
    fi
done

# Preserve default behavior of linting the whole repo when no target is passed.
if [[ "$#" -eq 0 ]]; then
    set -- .
fi

# Build ESLint args
ESLINT_ARGS=()
if [[ "$USE_CACHE" == "true" ]]; then
    ESLINT_ARGS+=(
        --cache
        --cache-location=node_modules/.cache/eslint
        --cache-strategy content
    )
fi
ESLINT_ARGS+=(
    --concurrency=auto
    --no-warn-ignored
    "$@"
)

# Run ESLint with the repo's default memory ceiling and seatbelt behavior.
NODE_OPTIONS="${NODE_OPTIONS:---max_old_space_size=8192}" \
SEATBELT_FROZEN="${SEATBELT_FROZEN:-0}" \
    exec npx eslint "${ESLINT_ARGS[@]}"
