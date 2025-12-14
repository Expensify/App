#!/bin/bash

# Extract allowed rules from code-inline-reviewer.md
# Rules are in format [PREFIX-NUMBER] where PREFIX is uppercase letters
set -euo pipefail

REVIEWER_FILE="${1:-.claude/agents/code-inline-reviewer.md}"
OUTPUT_FILE="${2:-.claude/allowed-rules.txt}"

if [[ ! -f "$REVIEWER_FILE" ]]; then
    echo "Error: Reviewer file not found: $REVIEWER_FILE" >&2
    exit 1
fi

# Extract rules in format [CAPS-NUMBER] (e.g., [PERF-1], [SEC-1], [STYLE-1])
# Remove brackets to store as PERF-1, SEC-1, etc.
grep -oE '\[[A-Z]+-[0-9]+\]' "$REVIEWER_FILE" | sed 's/\[\(.*\)\]/\1/' | sort -u > "$OUTPUT_FILE"

if [[ ! -s "$OUTPUT_FILE" ]]; then
    echo "Error: No allowed rules found in $REVIEWER_FILE" >&2
    exit 1
fi

echo "Extracted allowed rules:"
cat "$OUTPUT_FILE"

