#!/bin/bash

# Spell-checks files that have changed in this branch. If file paths are
# passed as arguments (e.g. by CI, which gets its file list from the PR
# API), those are checked instead and no change discovery happens.

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

if [[ "$#" -gt 0 ]]; then
    exec "${TOP}/node_modules/.bin/cspell" --color --no-must-find-files "$@"
fi

info "Fetching origin/main"
MERGE_BASE_SHA_HASH="$(get_merge_base_with_main)"
readonly MERGE_BASE_SHA_HASH

# Excludes dotfiles and files under dot-directories (e.g. .github/) to match this script's prior behavior
ALL_CHANGED_FILES="$(get_changed_files "$MERGE_BASE_SHA_HASH" | grep -v '^\.' || true)"
readonly ALL_CHANGED_FILES

if [[ -n "$ALL_CHANGED_FILES" ]]; then
    # shellcheck disable=SC2086 # For multiple files in variable
    exec "${TOP}/node_modules/.bin/cspell" --color --no-must-find-files $ALL_CHANGED_FILES
else
    info "No changed files to spell check"
fi
