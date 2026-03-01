#!/bin/bash

# Extract allowed rules from individual rule files in the rules directory.
# Each rule file has YAML frontmatter with a ruleId field.
set -euo pipefail

RULES_DIR="${1:-.claude/skills/coding-standards/rules}"
OUTPUT_FILE="${2:-.claude/allowed-rules.txt}"

if [[ ! -d "$RULES_DIR" ]]; then
    echo "Error: Rules directory not found: $RULES_DIR" >&2
    exit 1
fi

# Extract ruleId from YAML frontmatter of each non-underscore .md file
# Use multi-hyphen regex to validate rule ID format (e.g., PERF-1, CLEAN-REACT-PATTERNS-1)
true > "$OUTPUT_FILE"
for file in "$RULES_DIR"/[!_]*.md; do
    [[ -f "$file" ]] || continue
    grep -m1 '^ruleId:' "$file" | grep -oE '[A-Z]+(-[A-Z]+)*-[0-9]+' >> "$OUTPUT_FILE" || true
done

sort -u -o "$OUTPUT_FILE" "$OUTPUT_FILE"

if [[ ! -s "$OUTPUT_FILE" ]]; then
    echo "Error: No allowed rules found in $RULES_DIR" >&2
    exit 1
fi

echo "Extracted allowed rules:"
cat "$OUTPUT_FILE"
