#!/bin/bash

# Checks for changes between the common ancestor of origin/main and the
# current HEAD. 

source scripts/shellUtils.sh

MERGE_BASE_SHA_HASH=$(git merge-base origin/main HEAD)
# Check if output is empty.
if [ -z "${MERGE_BASE_SHA_HASH}" ]; then
    error "git merge-base did not return any output"
    exit 1
fi

# Check if the output of merge-base is a single SHA-1 commit hash.
if ! [[ "${MERGE_BASE_SHA_HASH}" =~ ^[a-fA-F0-9]{40}$ ]]; then
    error "git merge-base returned unexpected output"
    exit 1
fi

DIFF_OUTPUT=$(git --no-pager diff --diff-filter=AMR --name-only "${MERGE_BASE_SHA_HASH}" HEAD -- '*.ts' '*.tsx')

# Check if there were any changes.
if [ -z "${MERGE_BASE_SHA_HASH}" ]; then
    error "git diff returned no changed files"
    exit 1
fi

# Ensure this script is running inside an npm run context
if [[ -n "$npm_lifecycle_event" ]]; then
    eslint --max-warnings=0 --config ./.eslintrc.changed.js "${DIFF_OUTPUT}"
else
    error "This script is meant to run by using npm run lint-changed"
fi
