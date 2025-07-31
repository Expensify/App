#!/bin/bash

# Run Jest coverage for changed files with focused patterns

# Read changed files and create arrays instead of string concatenation
readarray -t CHANGED_FILES_ARRAY < changed_files.txt

# Build coverage patterns array
COVERAGE_ARGS=()
for file in "${CHANGED_FILES_ARRAY[@]}"; do
  COVERAGE_ARGS+=("--collectCoverageFrom=$file")
done

echo "Running coverage with focused patterns..."
echo "Coverage patterns: ${COVERAGE_ARGS[*]}"

# Run Jest with coverage focused on changed files only
NODE_OPTIONS="--max-old-space-size=4096 --experimental-vm-modules" npx jest \
  --coverage \
  --coverageDirectory=coverage \
  "${COVERAGE_ARGS[@]}" \
  --collectCoverageFrom="!src/**/*.d.ts" \
  --collectCoverageFrom="!src/**/*.stories.tsx" \
  --collectCoverageFrom="!src/**/*.test.{ts,tsx,js,jsx}" \
  --collectCoverageFrom="!src/**/*.spec.{ts,tsx,js,jsx}" \
  --collectCoverageFrom="!src/**/__tests__/**" \
  --collectCoverageFrom="!src/**/__mocks__/**" \
  --coverageReporters=json-summary \
  --coverageReporters=lcov \
  --coverageReporters=html \
  --coverageReporters=text-summary \
  --maxWorkers=2 \
  --testTimeout=30000 \
  --silent
