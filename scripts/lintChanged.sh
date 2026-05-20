#!/bin/bash

# Lints .ts and .tsx files that have changed in this branch

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

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
if ! GIT_DIFF_OUTPUT="$(git diff --diff-filter=AMR --name-only "$MERGE_BASE_SHA_HASH" HEAD -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs')"; then
    error "git diff failed - output: $GIT_DIFF_OUTPUT"
    exit 1
fi

# Run eslint on the changed files, forwarding any user-provided flags
if [[ -n "$GIT_DIFF_OUTPUT" ]] ; then
    # shellcheck disable=SC2086 # For multiple files in variable
    exec "${TOP}/scripts/lint.sh" "$@" $GIT_DIFF_OUTPUT
else
    info "No lintable files changed"
fi
