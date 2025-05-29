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
git fetch origin main --no-tags

MERGE_BASE_SHA_HASH="$(git merge-base origin/main HEAD)"
# Check if output is empty or malformed
if [[ -z "$MERGE_BASE_SHA_HASH" ]] || ! [[ "$MERGE_BASE_SHA_HASH" =~ ^[a-fA-F0-9]{40}$ ]]; then
    error "git merge-base returned unexpected output"
    exit 1
fi

# Get the diff output and check status
GIT_DIFF_OUTPUT="$(git diff --diff-filter=AMR --name-only "$MERGE_BASE_SHA_HASH" HEAD -- '*.ts' '*.tsx')"
# shellcheck disable=SC2181
if [[ $? -ne 0 ]]; then
  error "git diff failed"
  exit 1
fi

# Populate an array with changed files to handle large number of changes.
DIFF_FILES=()
# Use a here-string to pass the output into the function
read_lines_into_array DIFF_FILES <<< "$GIT_DIFF_OUTPUT"

# Run eslint on the changed files
if [ "${#DIFF_FILES[@]}" -gt 0 ]; then
  eslint --max-warnings=0 --config ./.eslintrc.changed.js "${DIFF_FILES[@]}"
else
  info "No TypeScript files changed"
fi
