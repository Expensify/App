#!/bin/bash

# Run ESLint with the repo's standard flags (memory ceiling, shared content
# cache, auto concurrency). Delegate target selection to the caller:
#
#   ./scripts/lint.sh                 -> lint the whole repo
#   ./scripts/lint.sh src/foo.ts ...  -> lint just the given paths

set -euo pipefail

NODE_OPTIONS="${NODE_OPTIONS:---max_old_space_size=8192}" \
SEATBELT_FROZEN="${SEATBELT_FROZEN:-0}" \
    exec npx eslint \
        --cache \
        --cache-location=node_modules/.cache/eslint \
        --cache-strategy content \
        --concurrency=auto \
        --no-warn-ignored \
        "${@:-.}"
