#!/bin/bash
# Generate baseline coverage from main branch for CHANGED FILES ONLY

# Save current coverage first (from PR branch)
mv coverage pr-coverage

# Fetch and checkout main branch files
git fetch origin main
git checkout origin/main -- .

# Install dependencies
npm install

# Read the same changed files that were used for PR coverage
readarray -t CHANGED_FILES_ARRAY < changed_files.txt

# Build coverage patterns array (same as PR)
COVERAGE_ARGS=()
for file in "${CHANGED_FILES_ARRAY[@]}"; do
    COVERAGE_ARGS+=("--collectCoverageFrom=$file")
done

# Get CPU core count with fallback
echo "MAX_WORKERS environment variable: ${MAX_WORKERS}"
WORKERS=${MAX_WORKERS:-4}
echo "Using $WORKERS workers (w/ fallback to 4)"

echo "Running baseline coverage for changed files only..."
echo "Coverage patterns: ${COVERAGE_ARGS[*]}"
echo "Timeout: 60s, Workers: $WORKERS, Memory: 8GB"

# Run Jest with coverage focused on SAME changed files
NODE_OPTIONS="--experimental-vm-modules" npx jest \
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
    --maxWorkers="$WORKERS" \
    --testTimeout=60000 \
    --silent

# Move main branch coverage to baseline directory
mv coverage baseline-coverage

# Restore PR branch coverage
mv pr-coverage coverage
