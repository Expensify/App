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

# Check if comment body contains a reference to an allowed rule
ALLOWED_RULES_FILE="${GITHUB_WORKSPACE}/.claude/allowed-rules.txt"

if [[ -f "$ALLOWED_RULES_FILE" ]]; then
    # Extract rule IDs from comment body (format: [CAPS-NUMBER] e.g., [PERF-1], [SEC-1], [STYLE-1])
    COMMENT_RULE=$(echo "$BODY_ARG" | grep -oE '\[[A-Z]+-\d+\]' | head -1)
    
    if [[ -z "$COMMENT_RULE" ]]; then
        echo "Error: Comment body must contain a reference to an allowed rule (e.g., [PERF-1])" >&2
        echo "Allowed rules:" >&2
        cat "$ALLOWED_RULES_FILE" >&2
        exit 1
    fi
    
    # Check if the rule is in the allowed list
    if ! grep -qF "$COMMENT_RULE" "$ALLOWED_RULES_FILE"; then
        echo "Error: Rule $COMMENT_RULE is not in the allowed rules list" >&2
        echo "Allowed rules:" >&2
        cat "$ALLOWED_RULES_FILE" >&2
        exit 1
    fi
else
    echo "Warning: Allowed rules file not found at $ALLOWED_RULES_FILE. Skipping rule validation." >&2
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
