#!/bin/bash

TEST_DIR=$(dirname "$(dirname "$(realpath "$0")")")
getPullRequestsMergedBetween="$TEST_DIR/utils/getPullRequestsMergedBetween.js"

source "$TEST_DIR/../shellUtils.sh"

function print_version {
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
git tag "$(print_version)"
git checkout main
success "Created initial tag $(print_version)"

success "Setup complete!"


title "Scenario #1: Merge a pull request while the checklist is unlocked"

# Create "PR 1", and merge that PR to main.
info "Creating PR #1"
git checkout main
git checkout -b pr-1
echo "Changes from PR #1" >> PR1.txt
git add PR1.txt
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
git commit -m "Update version to $(print_version)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #2 from Expensify/version-bump"
info "Merged PR #2 to main"
git branch -d version-bump
success "Version bumped to $(print_version) on main"

# Merge main into staging
info "Merging main into staging..."
git checkout staging
git checkout -b update-staging-from-main
git merge --no-edit -Xtheirs main
git checkout staging
git merge update-staging-from-main --no-ff -m "Merge pull request #3 from Expensify/update-staging-from-main"
info "Merged PR #3 to staging"
git branch -d update-staging-from-main
success "Merged main into staging!"

# Tag staging
info "Tagging new version..."
git checkout staging
git tag "$(print_version)"
git checkout main
success "Created new tag $(print_version)"

# Verify output
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.2')
assert_equal "$output" "[ '1' ]"

success "Scenario #1 completed successfully!"


title "Scenario #2: Locking the deploy checklist"

# Bump the version to 1.1.0 on main
info "Bumping the version to 1.1.0 on main..."
git checkout main
git checkout -b version-bump
npm --no-git-tag-version version 1.1.0 -m "Update version to 1.1.0"
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #4 from Expensify/version-bump"
info "Merged PR #4 to main"
git br -d version-bump
success "Version bumped to $(print_version) on main!"

# Merge main into staging
info "Merging main into staging..."
git checkout staging
git checkout -b update-staging-from-main
git merge --no-edit -Xtheirs main
git checkout staging
git merge update-staging-from-main --no-ff -m "Merge pull request #5 from Expensify/update-staging-from-main"
info "Merged PR #5 into main"
git branch -d update-staging-from-main
success "Merged main into staging!"

# Tag the new version on staging
info "Tagging the new version on staging..."
git checkout staging
git tag "$(print_version)"
success "Successfully created tag $(print_version)"

# Verify output
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.1.0"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.1.0')
assert_equal "$output" "[ '1' ]"

success "Scenario #2 completed successfully!"


title "Scenario #3: Merge a pull request with the checklist locked, but don't CP it"

info "Creating PR #6 and merging it into main..."
git checkout main
git checkout -b pr-6
echo "Changes from PR #6" >> PR6.txt
git add PR6.txt
git commit -m "Changes from PR #6"
git checkout main
git merge pr-6 --no-ff -m "Merge pull request #6 from Expensify/pr-6"
info "Merged PR #6 into main"
git branch -d pr-6
success "Created PR #6 and merged it to main!"

success "Scenario #3 completed successfully!"


title "Scenario #4: Merge a pull request with the checklist locked and CP it to staging"

info "Creating PR #7 and merging it into main..."
git checkout main
git checkout -b pr-7
echo "Changes from PR #7" >> PR7.txt
git add PR7.txt
git commit -m "Changes from PR #7"
git checkout main
git merge pr-7 --no-ff -m "Merge pull request #7 from Expensify/pr-7"
PR_7_MERGE_COMMIT="$(git log --format='%H' HEAD^..HEAD)"
info "Merged PR #7 into main"
git branch -d pr-7
success "Created PR #7 and merged it to main!"

info "Bumping version to 1.1.1 on main..."
git checkout main
git checkout -b version-bump
npm --no-git-tag-version version 1.1.1 -m "Update version to 1.1.1"
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #8 from Expensify/version-bump"
VERSION_BUMP_MERGE_COMMIT="$(git log --format='%H' HEAD^..HEAD)"
info "Merged PR #8 into main"
git br -d version-bump
success "Bumped version to 1.1.1 on main!"

info "Cherry picking PR #7 and the version bump to staging..."
git checkout staging
git checkout -b cherry-pick-staging-7
git cherry-pick -S -x --mainline 1 --strategy=recursive -Xtheirs "$PR_7_MERGE_COMMIT"
git cherry-pick -S -x --mainline 1 "$VERSION_BUMP_MERGE_COMMIT"
git checkout staging
git merge cherry-pick-staging-7 --no-ff -m "Merge pull request #9 from Expensify/cherry-pick-staging-7"
git br -d cherry-pick-staging-7
info "Merged PR #9 into staging"
success "Successfully cherry-picked PR #7 to staging!"

info "Tagging the new version on staging..."
git checkout staging
git tag "$(print_version)"
success "Created tag $(print_version)"

# Verify output
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.1.1')
assert_equal "$output" "[ '9', '7', '1' ]"

success "Scenario #4 completed successfully!"

### Cleanup
title "Cleaning up..."
cd "$TEST_DIR" || exit 1
rm -rf "$DUMMY_DIR"
success "All tests passed! Hooray!"
