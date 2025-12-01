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
FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/coverage/*" \
  ! -path "*/Mobile-Expensify/*" \
  ! -path "*/docs/*" \
  ! -path "*/.rock/*" \
  ! -path "*/.expo/*" \
  | sort)

# Calculate chunk size
TOTAL_FILES=$(echo "$FILES" | wc -l | tr -d ' ')
CHUNK_SIZE=$((TOTAL_FILES / TOTAL))
REMAINDER=$((TOTAL_FILES % TOTAL))

# Calculate start and end indices for this chunk
if [ "$CHUNK" -le "$REMAINDER" ]; then
  START=$(((CHUNK - 1) * (CHUNK_SIZE + 1) + 1))
  END=$((CHUNK * (CHUNK_SIZE + 1)))
else
  START=$((REMAINDER * (CHUNK_SIZE + 1) + (CHUNK - REMAINDER - 1) * CHUNK_SIZE + 1))
  END=$((START + CHUNK_SIZE - 1))
fi

# Extract files for this chunk
CHUNK_FILES=$(echo "$FILES" | sed -n "${START},${END}p")

if [ -z "$CHUNK_FILES" ]; then
  echo "No files to lint in chunk $CHUNK"
  exit 0
fi

# Run ESLint on this chunk
echo "Linting chunk $CHUNK/$TOTAL (files $START-$END of $TOTAL_FILES)"
echo "$CHUNK_FILES" | xargs npx eslint --max-warnings=145 --cache --cache-location=node_modules/.cache/eslint --concurrency=auto
