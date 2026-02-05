#!/bin/bash

# Extract allowed rules from skill reference files
# Rules are in format [PREFIX-NUMBER] where PREFIX is uppercase letters (in ## headings)
set -euo pipefail

REFERENCES_DIR="${1:-.claude/skills/expensify-code-patterns/references}"
OUTPUT_FILE="${2:-.claude/allowed-rules.txt}"

if [[ ! -d "$REFERENCES_DIR" ]]; then
    echo "Error: References directory not found: $REFERENCES_DIR" >&2
    exit 1
fi

# Extract rules from ## headings in format "## PREFIX-NUMBER: Title"
# e.g., "## PERF-1: No spread in renderItem" -> "PERF-1"
grep -rhoE '^## [A-Z]+-[0-9]+' "$REFERENCES_DIR"/*.md | sed 's/^## //' | sort -u > "$OUTPUT_FILE"

if [[ ! -s "$OUTPUT_FILE" ]]; then
    echo "Error: No allowed rules found in $REFERENCES_DIR" >&2
    exit 1
fi

echo "Extracted allowed rules:"
cat "$OUTPUT_FILE"
