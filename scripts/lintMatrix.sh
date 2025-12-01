#!/bin/bash

# Lints files in parallel chunks for CI
# Usage: ./scripts/lintMatrix.sh [<chunk_number>] [<total_chunks>]
# If chunk_number and total_chunks are not provided, reads from ESLINT_CHUNK and ESLINT_TOTAL env vars

set -eu

CHUNK=${1:-${ESLINT_CHUNK:-}}
TOTAL=${2:-${ESLINT_TOTAL:-}}

if [ -z "$CHUNK" ] || [ -z "$TOTAL" ]; then
    echo "Error: Chunk number and total chunks must be provided as arguments or environment variables"
    echo "Usage: $0 <chunk_number> <total_chunks>"
    echo "   or: ESLINT_CHUNK=<n> ESLINT_TOTAL=<t> $0"
    exit 1
fi

# Find all lintable files
ALL_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/coverage/*" \
  ! -path "*/Mobile-Expensify/*" \
  ! -path "*/docs/*" \
  ! -path "*/.rock/*" \
  ! -path "*/.expo/*" \
  2>/dev/null | sort)

# Sort files by size (largest first) and create a weighted distribution
# Remove the "total" line that wc -l adds at the end
FILE_SIZES=$(echo "$ALL_FILES" | xargs wc -l 2>/dev/null | grep -v "^[[:space:]]*[0-9]*[[:space:]]*total$" | sort -rn)

# Use a weighted round-robin: distribute files so each chunk gets similar total line count
# This accounts for the fact that large files take longer to lint
CHUNK_FILES=$(echo "$FILE_SIZES" | awk -v chunk="$CHUNK" -v total="$TOTAL" '{
  lines = $1
  file = $2
  # Simple round-robin for now, but sorted by size so large files are distributed
  file_chunk = ((NR - 1) % total) + 1
  if (file_chunk == chunk) {
    print file
  }
}')

TOTAL_FILES=$(echo "$SORTED_FILES" | wc -l | tr -d ' ')
CHUNK_COUNT=$(echo "$CHUNK_FILES" | grep -c . || echo "0")

# Run ESLint on this chunk
echo "Linting chunk $CHUNK/$TOTAL ($CHUNK_COUNT files out of $TOTAL_FILES total)"
if [ "$CHUNK_COUNT" -eq 0 ]; then
  echo "No files to lint in chunk $CHUNK"
  exit 0
fi

echo "$CHUNK_FILES" | xargs npx eslint --max-warnings=145 --cache --cache-location=node_modules/.cache/eslint --concurrency=auto

