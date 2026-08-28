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

# Diff against the working tree (not HEAD) so staged and unstaged changes are included too
if ! GIT_DIFF_OUTPUT="$(git diff --diff-filter=AMR --name-only "$MERGE_BASE_SHA_HASH" -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs')"; then
    error "git diff failed - output: $GIT_DIFF_OUTPUT"
    exit 1
fi

# Untracked files are not part of the diff above, so list them separately
UNTRACKED_OUTPUT="$(git ls-files --others --exclude-standard -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs')"
readonly UNTRACKED_OUTPUT

ALL_CHANGED_FILES="$(printf '%s\n%s' "$GIT_DIFF_OUTPUT" "$UNTRACKED_OUTPUT" | grep -v '^$' || true)"
readonly ALL_CHANGED_FILES

# Run eslint on the changed files, forwarding any user-provided flags
if [[ -n "$ALL_CHANGED_FILES" ]] ; then
    # shellcheck disable=SC2086 # For multiple files in variable
    exec bun "${TOP}/scripts/lint.ts" "$@" $ALL_CHANGED_FILES
else
    info "No lintable files changed"
fi
