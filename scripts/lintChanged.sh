#!/bin/bash

# Lints .ts and .tsx files that have changed in this branch

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

MERGE_BASE_SHA_HASH="$(git merge-base origin/main HEAD)"
# Check if output is empty or malformed
if [[ -z "${MERGE_BASE_SHA_HASH}" ]] || ! [[ "${MERGE_BASE_SHA_HASH}" =~ ^[a-fA-F0-9]{40}$ ]]; then
    error "git merge-base returned unexpected output"
    exit 1
fi

DIFF_OUTPUT="$(git --no-pager diff --diff-filter=AMR --name-only "$MERGE_BASE_SHA_HASH" HEAD -- '*.ts' '*.tsx')"
# Check if there were any changes.
# shellcheck disable=SC2181 # Long command
if [[ $? -ne 0 ]] ; then
    error "git diff failed"
    exit 1
fi

# Ensure this script is running inside an npm run context
IS_NPM_CONTEXT="${npm_lifecycle_event:-}"
if [[ -z $IS_NPM_CONTEXT ]]; then
    info "Re-executing this script from an npm context"
    exec npx -c "NODE_OPTIONS=--max_old_space_size=8192 ${BASH_SOURCE[0]} $*"
fi
eslint --max-warnings=0 --config ./.eslintrc.changed.js "${DIFF_OUTPUT}"