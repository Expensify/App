#!/bin/bash

# Source existing utilities for colored output
source scripts/shellUtils.sh

# Parse arguments
PR_URL=$1
TARGET=${2:-staging}

if [[ -z "$PR_URL" ]]; then
    error "Usage: $0 <PR_URL> [TARGET]"
    error "Example: $0 https://github.com/Expensify/App/pull/12345 staging"
    exit 1
fi

# Extract PR number from URL
PR_NUMBER=$(echo $PR_URL | grep -oE '[0-9]+$')

# Step 1: Trigger cherry pick
info "🚀 Starting cherry pick for PR #$PR_NUMBER to $TARGET"
gh workflow run cherryPick.yml \
  -f PULL_REQUEST_URL="$PR_URL" \
  -f TARGET="$TARGET"

# Step 2: Get the run ID (wait a bit for it to register)
sleep 5
RUN_ID=$(gh run list -w cherryPick.yml --limit 1 --json databaseId -q '.[0].databaseId')
info "Cherry pick workflow started: Run ID $RUN_ID"

# Step 3: Monitor the cherry pick
info "Monitoring cherry pick workflow..."
gh run watch $RUN_ID

# Step 4: Check if it succeeded
STATUS=$(gh run view $RUN_ID --json conclusion -q '.conclusion')

if [[ "$STATUS" == "success" ]]; then
    success "✅ Cherry pick completed successfully!"

    # Step 5: Find and monitor test build
    info "Looking for test build..."
    sleep 10
    TEST_RUN_ID=$(gh run list -w testBuild.yml --limit 1 --json databaseId -q '.[0].databaseId')

    if [[ -n "$TEST_RUN_ID" ]]; then
        info "Monitoring test build: Run ID $TEST_RUN_ID"
        gh run watch $TEST_RUN_ID

        TEST_STATUS=$(gh run view $TEST_RUN_ID --json conclusion -q '.conclusion')
        if [[ "$TEST_STATUS" == "success" ]]; then
            success "✅ Test build complete! Please retest PR #$PR_NUMBER"
        else
            error "Test build failed with status: $TEST_STATUS"
        fi
    else
        error "Could not find test build run"
    fi
else
    error "❌ Cherry pick failed with status: $STATUS"
    exit 1
fi