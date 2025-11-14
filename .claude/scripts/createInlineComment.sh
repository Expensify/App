#!/bin/bash

# Secure proxy script to create an inline comment on a GitHub PR
set -eu

PATH_ARG="$1"
BODY_ARG="$2"
LINE_ARG="$3"

REPO="${GITHUB_REPOSITORY}"
PR_NUMBER="${PR_NUMBER}"

if [[ -z "$PATH_ARG" || -z "$BODY_ARG" || -z "$LINE_ARG" ]]; then
    echo "Usage: $0 <path> <body> <line>" >&2
    exit 1
fi

# Get commit ID from PR head
COMMIT_ID=$(gh api "/repos/$REPO/pulls/$PR_NUMBER" --jq '.head.sha')

# Build JSON payload with proper types (line must be integer, not string)
# Using jq with --arg automatically escapes special characters safely
PAYLOAD=$(jq -n \
    --arg body "$BODY_ARG" \
    --arg path "$PATH_ARG" \
    --argjson line "$LINE_ARG" \
    --arg commit_id "$COMMIT_ID" \
    '{body: $body, path: $path, line: $line, side: "RIGHT", commit_id: $commit_id}')

gh api -X POST "/repos/$REPO/pulls/$PR_NUMBER/comments" \
    --input - <<< "$PAYLOAD"
