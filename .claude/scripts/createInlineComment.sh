#!/bin/bash

# Secure proxy script to create an inline comment on a GitHub PR.
set -eu

readonly ALLOWED_RULES_FILE="${GITHUB_WORKSPACE}/.claude/allowed-rules.txt"

# Print error and exit.
die() {
    echo "Error: $*" >&2
    exit 1
}

# Usage helper to avoid repeated text.
usage() {
    die "Usage: $0 <path> <body> <line>"
}

COMMENT_STATUS_REASON=""

# Ensure the comment body references an allowed rule tag.
validate_rule() {
    local body="$1"
    local rule

    [[ -f "$ALLOWED_RULES_FILE" ]] || die "Comment rejected: allowed rules file missing at $ALLOWED_RULES_FILE"

    rule=$(echo "$body" | grep -oE '[A-Z]+-[0-9]+' | head -1 || true)
    [[ -n "$rule" ]] || die "Comment rejected: missing allowed rule reference (e.g. PERF-1)"

    if grep -qF "$rule" "$ALLOWED_RULES_FILE"; then
        COMMENT_STATUS_REASON="rule $rule validated"
        return 0
    fi

    die "Comment rejected: rule $rule not present in allowed list"
}

readonly PATH_ARG="${1:-}"
readonly BODY_ARG="${2:-}"
readonly LINE_ARG="${3:-}"

[[ -z "$PR_NUMBER" ]] && die "Environment variable PR_NUMBER is required"
[[ -z "$GITHUB_REPOSITORY" ]] && die "Environment variable GITHUB_REPOSITORY is required"
[[ -z "$PATH_ARG" || -z "$BODY_ARG" || -z "$LINE_ARG" ]] && usage

validate_rule "$BODY_ARG"
echo "Comment approved: $COMMENT_STATUS_REASON"

readonly FOOTER=$'\n\n---\n\nPlease rate this suggestion with 👍 or 👎 to help us improve! Reactions are used to monitor reviewer efficiency.'
readonly COMMENT_BODY="${BODY_ARG}${FOOTER}"

COMMIT_ID=$(gh api "/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER" --jq '.head.sha')
readonly COMMIT_ID

PAYLOAD=$(jq -n \
    --arg body "$COMMENT_BODY" \
    --arg path "$PATH_ARG" \
    --argjson line "$LINE_ARG" \
    --arg commit_id "$COMMIT_ID" \
    '{body: $body, path: $path, line: $line, side: "RIGHT", commit_id: $commit_id}')
readonly PAYLOAD

gh api -X POST "/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/comments" \
    --input - <<< "$PAYLOAD" || exit 1
