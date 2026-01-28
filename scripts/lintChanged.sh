#!/bin/bash

# Lints .ts and .tsx files that have changed in this branch

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

# Ensure this script is running inside an npm run context
if [[ -z "${npm_lifecycle_event:-}" ]]; then
    info "Re-executing this script from an npm context"
    exec npx -c "NODE_OPTIONS=--max_old_space_size=8192 ${BASH_SOURCE[0]} $*"
fi

# Fetch the commit history to include the merge-base commit
info "Fetching origin/main"
git fetch origin main --no-tags

MERGE_BASE_SHA_HASH="$(git merge-base origin/main HEAD)"
readonly MERGE_BASE_SHA_HASH

# Check if output is empty or malformed
if [[ -z "$MERGE_BASE_SHA_HASH" ]] || ! [[ "$MERGE_BASE_SHA_HASH" =~ ^[a-fA-F0-9]{40}$ ]]; then
    error "git merge-base returned unexpected output: $MERGE_BASE_SHA_HASH"
    exit 1
fi

# Get the diff output and check status
if ! GIT_DIFF_OUTPUT="$(git diff --diff-filter=AMR --name-only "$MERGE_BASE_SHA_HASH" HEAD -- '*.ts' '*.tsx')"; then
    error "git diff failed - output: $GIT_DIFF_OUTPUT"
    exit 1
fi

# Run eslint on the changed files
if [[ -n "$GIT_DIFF_OUTPUT" ]] ; then
    # shellcheck disable=SC2086 # For multiple files in variable
    eslint --concurrency=auto --max-warnings=145 --cache --cache-location=node_modules/.cache/eslint-changed --cache-strategy content --config ./eslint.changed.config.mjs $GIT_DIFF_OUTPUT
else
    info "No TypeScript files changed"
fi
