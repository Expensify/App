#!/bin/bash

# Extract allowed rules from code-inline-reviewer.md
# Rules are in format [PREFIX-NUMBER] where PREFIX is uppercase letters
set -eu

REVIEWER_FILE="${1:-.claude/agents/code-inline-reviewer.md}"
OUTPUT_FILE="${2:-.claude/allowed-rules.txt}"

if [[ ! -f "$REVIEWER_FILE" ]]; then
    echo "Error: Reviewer file not found: $REVIEWER_FILE" >&2
    exit 1
fi

# Extract rules in format [CAPS-NUMBER] (e.g., [PERF-1], [SEC-1], [STYLE-1])
grep -oE '\[[A-Z]+-\d+\]' "$REVIEWER_FILE" | sort -u > "$OUTPUT_FILE"

echo "Extracted allowed rules:"
cat "$OUTPUT_FILE"

