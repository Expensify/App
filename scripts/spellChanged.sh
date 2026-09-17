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

# Excludes common binary/media file types since spell-checking them is pointless and wasteful
CHANGED_FILES_OUTPUT="$(get_changed_files "$MERGE_BASE_SHA_HASH" ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' ':!*.mp4' ':!*.mov' ':!*.zip' ':!*.tar.gz' ':!*.heapsnapshot' ':!*.pdf')"
declare -a ALL_CHANGED_FILES=()
if [[ -n "$CHANGED_FILES_OUTPUT" ]]; then
    # Excludes any path starting with "." (dotfiles and top-level dot-directories like .github/), matching CI's filter. A nested dot-directory, e.g. docs/.hidden/config.ts, is still checked.
    while IFS= read -r file; do
        if [[ "$file" != .* ]]; then
            ALL_CHANGED_FILES+=("$file")
        fi
    done <<< "$CHANGED_FILES_OUTPUT"
fi
readonly -a ALL_CHANGED_FILES

if [[ "${#ALL_CHANGED_FILES[@]}" -gt 0 ]]; then
    exec "${TOP}/node_modules/.bin/cspell" --color --no-must-find-files "${ALL_CHANGED_FILES[@]}"
else
    info "No changed files to spell check"
fi
