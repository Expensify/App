#!/bin/bash

# Run ESLint with the repo's standard flags (memory ceiling, shared content
# cache, auto concurrency). Delegate target selection to the caller:
#
#   ./scripts/lint.sh                      -> lint the whole repo
#   ./scripts/lint.sh src/foo.ts ...       -> lint just the given paths
#   ./scripts/lint.sh --show-warnings ...  -> include grandfathered seatbelt warnings in the output
#
# By default we pass `--quiet` to ESLint so only blocking errors are printed.
# eslint-seatbelt reclassifies grandfathered violations as warnings, so the
# default output mirrors what CI cares about. Pass `--show-warnings` to
# restore the full output (errors + warnings).

set -euo pipefail

# parse args
USE_CACHE=true
SHOW_WARNINGS=false
PASSTHROUGH_ARGS=()
for ARG in "$@"; do
    case "$ARG" in
        --no-cache)
            USE_CACHE=false
            ;;
        --show-warnings)
            SHOW_WARNINGS=true
            ;;
        *)
            PASSTHROUGH_ARGS+=("$ARG")
            ;;
    esac
done

# Preserve default behavior of linting the whole repo when no target is passed.
if [[ "${#PASSTHROUGH_ARGS[@]}" -eq 0 ]]; then
    PASSTHROUGH_ARGS=(.)
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
if [[ "$SHOW_WARNINGS" == "false" ]]; then
    ESLINT_ARGS+=(--quiet)
fi
ESLINT_ARGS+=(
    --concurrency=auto
    --no-warn-ignored
    "${PASSTHROUGH_ARGS[@]}"
)

# Run ESLint with the repo's default memory ceiling and seatbelt behavior.
NODE_OPTIONS="${NODE_OPTIONS:---max_old_space_size=8192}" \
SEATBELT_FROZEN="${SEATBELT_FROZEN:-0}" \
    exec npx eslint "${ESLINT_ARGS[@]}"
