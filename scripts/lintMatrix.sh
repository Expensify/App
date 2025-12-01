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

# Sort files by size (largest first) to distribute load better
# Then use round-robin to assign files to chunks
SORTED_FILES=$(echo "$ALL_FILES" | xargs wc -l 2>/dev/null | sort -rn | awk 'NR>1 {print $2}')

# Use round-robin distribution: assign each file to a chunk in round-robin fashion
# This distributes large files evenly across chunks
CHUNK_FILES=$(echo "$SORTED_FILES" | awk -v chunk="$CHUNK" -v total="$TOTAL" '{
  # Round-robin: file number % total chunks + 1
  file_chunk = ((NR - 1) % total) + 1
  if (file_chunk == chunk) {
    print
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
