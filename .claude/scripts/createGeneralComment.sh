#!/bin/bash

# Creates an inline comment on a GitHub PR for the general reviewer.
# Unlike createInlineComment.sh, this script does NOT validate against allowed rules
# since general reviews are free-form and not rule-bound.
#
# Usage: createGeneralComment.sh <path> <body> <line>

set -eu

# Print error and exit.
die() {
    echo "Error: $*" >&2
    exit 1
}

# Usage helper.
usage() {
    die "Usage: $0 <path> <body> <line>"
}

readonly PATH_ARG="${1:-}"
readonly BODY_ARG="${2:-}"
readonly LINE_ARG="${3:-}"

[[ -z "$PR_NUMBER" ]] && die "Environment variable PR_NUMBER is required"
[[ -z "$GITHUB_REPOSITORY" ]] && die "Environment variable GITHUB_REPOSITORY is required"
[[ -z "$PATH_ARG" || -z "$BODY_ARG" || -z "$LINE_ARG" ]] && usage

# Validate line is a number
[[ "$LINE_ARG" =~ ^[0-9]+$ ]] || die "Line number must be a positive integer"

# Get the HEAD commit SHA for the PR
COMMIT_ID=$(gh api "/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER" --jq '.head.sha')
readonly COMMIT_ID

[[ -z "$COMMIT_ID" ]] && die "Could not retrieve commit ID for PR $PR_NUMBER"

# Build JSON payload safely using jq
PAYLOAD=$(jq -n \
    --arg body "$BODY_ARG" \
    --arg path "$PATH_ARG" \
    --argjson line "$LINE_ARG" \
    --arg commit_id "$COMMIT_ID" \
    '{body: $body, path: $path, line: $line, side: "RIGHT", commit_id: $commit_id}')
readonly PAYLOAD

# Create the inline comment via GitHub API
gh api -X POST "/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/comments" \
    --input - <<< "$PAYLOAD" || exit 1

echo "Created general review comment on $PATH_ARG:$LINE_ARG"
