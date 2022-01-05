#!/bin/bash

source "$(dirname "$0")/../../shellUtils.sh"


### Phase 0: Verify necessary tools are installed

# Note: jq is required to run this script. It comes preinstalled on GitHub Actions runners, where this test is run.
# If it is not available, you should install it and rerun this script
if ! command -v jq &> /dev/null
then
  error "command jq could not be found, install it with \`brew install jq\` (macOS) or \`apt-get install jq\` (Linux) and re-run this script"
  exit 1
fi

if ! command -v npm &> /dev/null
then
  error "command npm could not be found, install it and re-run this script"
  exit 1
fi


### Phase 1: Setup

info "Creating new DummyRepo..."
cd "$(dirname "$0")/../../.." || exit 1
mkdir DummyRepo
cd DummyRepo || exit 1
success "Successfully created DummyRepo at $(pwd)/DummyRepo"

info "Initializing npm project in DummyRepo..."
if [[ $(npm init -y) ]]
then
  success "Successfully initialized npm project"
else
  error "Failed initializing npm project"
  exit 1
fi

info "Installing node dependencies..."
if [[ $(npm install underscore && npm install) ]]
then
  success "Successfully installed node dependencies"
else
  error "Failed installing node dependencies"
  exit 1
fi

info "Initializing Git repo..."
git init -b main
git add package.json package-lock.json
git commit -m "Initial commit"

info "Bumping version to 1.0.0"
npm --no-git-tag-version version 1.0.0 -m "Update version to 1.0.0"
git add package.json
git commit -m "Update version to 1.0.0"

info "Creating branches..."
git checkout -b staging
git checkout -b production
git checkout main

info "Creating initial tag..."
git checkout staging
git tag "$(< package.json jq -r .version)"
git checkout main


### Phase 2: Merge a pull request when the checklist is unlocked

# Create "PR 1", and merge that PR to main.
git checkout main
git checkout -b pr-1
echo "Changes from PR #1" >> CHANGELOG.txt
git add CHANGELOG.txt
git commit -m "Changes from PR #1"
git checkout main
git merge pr-1 --no-ff -m "Merge pull request #1 from Expensify/pr-1"
git branch -d pr-1

# Bump the version to 1.0.1
git checkout main
git checkout -b version-bump
npm --no-git-tag-version version 1.0.1 -m "Update version to 1.0.1"
git add package.json package-lock.json
git commit -m "Update version to $(< package.json  jq -r .version)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #2 from Expensify/version-bump"
git branch -d version-bump

# Merge main into staging
git checkout staging
git checkout -b update-staging-from-main
git merge -Xtheirs main
git checkout staging
git merge update-staging-from-main --no-ff -m "Merge pull request #3 from Expensify/update-staging-from-main"
git branch -d update-staging-from-main

# Tag staging
git checkout staging
git tag "$(< package.json jq -r .version)"
git checkout main

### Phase X: Cleanup
info "Cleaning up..."
rm -rf DummyRepo

