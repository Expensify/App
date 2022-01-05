#!/bin/bash

TEST_DIR=$(dirname "$(dirname "$(realpath "$0")")")
getPullRequestsMergedBetween="$TEST_DIR/utils/getPullRequestsMergedBetween.js"

source "$TEST_DIR/../shellUtils.sh"

function printVersion {
  < package.json  jq -r .version
}

### Phase 0: Verify necessary tools are installed (all tools should be pre-installed on all GitHub Actions runners)

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


### Setup
title "Starting setup"

info "Creating new DummyRepo..."
DUMMY_DIR="$TEST_DIR/../../DummyRepo"
mkdir "$DUMMY_DIR"
cd "$DUMMY_DIR" || exit 1
success "Successfully created DummyRepo at $(pwd)"

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

info "Bumping version to 1.0.1"
npm --no-git-tag-version version 1.0.1 -m "Update version to 1.0.1"
git add package.json
git commit -m "Update version to 1.0.1"

info "Creating branches..."
git checkout -b staging
git checkout -b production
git checkout main

success "Initialized Git repo!"

info "Creating initial tag..."
git checkout staging
git tag "$(printVersion)"
git checkout main
success "Created initial tag $(printVersion)"

success "Setup complete!"

### Scenario #1: Merge a pull request when the checklist is unlocked
title "Starting scenario #1: Merge a pull request while the checklist is unlocked"

# Create "PR 1", and merge that PR to main.
info "Creating PR #1"
git checkout main
git checkout -b pr-1
echo "Changes from PR #1" >> CHANGELOG.txt
git add CHANGELOG.txt
git commit -m "Changes from PR #1"
success "Created PR #1 in branch pr-1"

info "Merging PR #1 to main"
git checkout main
git merge pr-1 --no-ff -m "Merge pull request #1 from Expensify/pr-1"
git branch -d pr-1
success "Merged PR #1 to main"

# Bump the version to 1.0.2
info "Bumping version to 1.0.2"
git checkout main
git checkout -b version-bump
npm --no-git-tag-version version 1.0.2 -m "Update version to 1.0.2"
git add package.json package-lock.json
git commit -m "Update version to $(printVersion)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #2 from Expensify/version-bump"
git branch -d version-bump
success "Version bumped to 1.0.2 on main"

# Merge main into staging
info "Merging main into staging..."
git checkout staging
git checkout -b update-staging-from-main
git merge -Xtheirs main
git checkout staging
git merge update-staging-from-main --no-ff -m "Merge pull request #3 from Expensify/update-staging-from-main"
git branch -d update-staging-from-main
success "Merged main into staging!"

# Tag staging
info "Tagging new version..."
git checkout staging
git tag "$(printVersion)"
git checkout main
success "Created new tag $(printVersion)"

# Verify output
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.2')
assert_equal "$output" "[ '1' ]"

success "Scenario #1 completed successfully!"

### Cleanup
title "Cleaning up..."
cd "$TEST_DIR" || exit 1
rm -rf "$DUMMY_DIR"
success "All tests passed! Hooray!"
