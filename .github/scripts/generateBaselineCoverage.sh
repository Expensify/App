#!/bin/bash

# Generate baseline coverage from main branch

# Save current coverage first (from PR branch)
mv coverage pr-coverage

# Fetch and checkout main branch files
git fetch origin main
git checkout origin/main -- .

# Install dependencies and run coverage for main branch
npm install

# Run Jest with coverage for all files (baseline coverage)
echo "Running baseline coverage for main branch..."
NODE_OPTIONS="--max-old-space-size=4096 --experimental-vm-modules" npx jest \
  --coverage \
  --coverageDirectory=coverage \
  --collectCoverageFrom="src/**/*.{ts,tsx,js,jsx}" \
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

# Move main branch coverage to baseline directory
mv coverage baseline-coverage

# Restore PR branch coverage
mv pr-coverage coverage
