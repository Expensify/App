#!/bin/bash

# Lints .ts and .tsx files that have changed in this branch

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

info "Fetching origin/main"
MERGE_BASE_SHA_HASH="$(get_merge_base_with_main)"
readonly MERGE_BASE_SHA_HASH

# Diffs against the working tree (not HEAD) and includes untracked files, so
# committed, staged, unstaged and untracked changes are all linted
CHANGED_FILES_OUTPUT="$(get_changed_files "$MERGE_BASE_SHA_HASH" '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs')"
declare -a ALL_CHANGED_FILES=()
if [[ -n "$CHANGED_FILES_OUTPUT" ]]; then
    while IFS= read -r file; do
        ALL_CHANGED_FILES+=("$file")
    done <<< "$CHANGED_FILES_OUTPUT"
fi

# Run eslint on the changed files, forwarding any user-provided flags
if [[ "${#ALL_CHANGED_FILES[@]}" -gt 0 ]]; then
    exec bun "${TOP}/scripts/lint.ts" "$@" "${ALL_CHANGED_FILES[@]}"
else
    info "No lintable files changed"
fi
