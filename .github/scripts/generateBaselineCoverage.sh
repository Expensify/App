#!/bin/bash

# Generate baseline coverage from main branch

# Save current coverage first (from PR branch)
mv coverage pr-coverage

# Fetch and checkout main branch files
git fetch origin main
git checkout origin/main -- .

# Install dependencies and run coverage for main branch
npm install
npm run test:coverage

# Move main branch coverage to baseline directory
mv coverage baseline-coverage

# Restore PR branch coverage
mv pr-coverage coverage
