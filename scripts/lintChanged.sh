#!/bin/bash

# Lints .ts and .tsx files that have changed in this branch

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

info "Fetching origin/main"
MERGE_BASE_SHA_HASH="$(get_merge_base_with_main)" || exit 1
readonly MERGE_BASE_SHA_HASH

# Diffs against the working tree (not HEAD) and includes untracked files, so
# committed, staged, unstaged and untracked changes are all linted
ALL_CHANGED_FILES="$(get_changed_files "$MERGE_BASE_SHA_HASH" '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs')"
readonly ALL_CHANGED_FILES

# Run eslint on the changed files, forwarding any user-provided flags
if [[ -n "$ALL_CHANGED_FILES" ]] ; then
    # shellcheck disable=SC2086 # For multiple files in variable
    exec bun "${TOP}/scripts/lint.ts" "$@" $ALL_CHANGED_FILES
else
    info "No lintable files changed"
fi
