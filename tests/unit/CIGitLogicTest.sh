#!/bin/bash

# Fail immediately if there is an error thrown
set -e

TEST_DIR=$(dirname "$(dirname "$(cd "$(dirname "$0")" || exit 1;pwd)/$(basename "$0")")")
SCRIPTS_DIR="$TEST_DIR/../scripts"
DUMMY_DIR="$HOME/DumDumRepo"
getPullRequestsMergedBetween="$TEST_DIR/utils/getPullRequestsMergedBetween.mjs"

source "$SCRIPTS_DIR/shellUtils.sh"

function print_version {
  < package.json jq -r .version
}

function setup_git_as_human {
  info "Switching to human git user"
  git config user.name test
  git config user.email test@test.com
}

function setup_git_as_osbotify {
  info "Switching to OSBotify git user"
  git config user.name OSBotify
  git config user.email infra+osbotify@expensify.com
}

### Phase 0: Verify necessary tools are installed (all tools should be pre-installed on all GitHub Actions runners)

if ! command -v jq &> /dev/null; then
  error "command jq could not be found, install it with \`brew install jq\` (macOS) or \`apt-get install jq\` (Linux) and re-run this script"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  error "command npm could not be found, install it and re-run this script"
  exit 1
fi


### Setup
title "Starting setup"

info "Creating new dummy repo at $DUMMY_DIR"
mkdir "$DUMMY_DIR"
cd "$DUMMY_DIR" || exit 1
success "Successfully created dummy repo at $(pwd)"

info "Initializing npm project in $DUMMY_DIR"
if [[ $(npm init -y) ]]; then
  success "Successfully initialized npm project"
else
  error "Failed initializing npm project"
  exit 1
fi

info "Installing node dependencies..."
if [[ $(npm install underscore) ]]; then
  success "Successfully installed node dependencies"
else
  error "Failed installing node dependencies"
  exit 1
fi

info "Initializing Git repo..."
git init -b main
setup_git_as_human
git add package.json package-lock.json
git commit -m "Initial commit"

info "Creating branches..."
git branch staging
git branch production

success "Initialized Git repo!"

info "Creating initial tag..."
git switch staging
git tag "$(print_version)"
git switch main
success "Created initial tag $(print_version)"

success "Setup complete!"


title "Scenario #1: Merge a pull request while the checklist is unlocked"

info "Creating PR #1 and merging it into main..."
git switch -c "pr-1"
echo "Changes from PR #1" >> "PR1.txt"
git add "PR1.txt"
git commit -m "Changes from PR #1"
success "Created PR #1 in branch pr-1"

info "Merging PR #1 to main"
git switch main
git merge "pr-1" --no-ff -m "Merge pull request #1 from Expensify/pr-1"
git branch -d "pr-1"
success "Merged PR #1 to main"

# Bump the version to 1.0.1
info "Bumping version to 1.0.1"
setup_git_as_osbotify
npm --no-git-tag-version version 1.0.1
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
success "Version bumped to $(print_version) on main"

# Recreate staging from main
info "Recreating staging from main..."
git branch -D staging
git switch -c staging
success "Recreated staging from main!"

# Tag staging
info "Tagging new version..."
git tag "$(print_version)"
success "Created new tag $(print_version)"
git switch main

# Verify output for checklist and deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.0 1.0.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.0' '1.0.1')
assert_equal "$output" "[ '1' ]"

success "Scenario #1 completed successfully!"


title "Scenario #2: Merge a pull request with the checklist locked, but don't CP it"

info "Creating PR #2 and merging it into main..."
setup_git_as_human
git switch -c "pr-2"
echo "Changes from PR #2" >> "PR2.txt"
git add "PR2.txt"
git commit -m "Changes from PR #2"
git switch main
git merge "pr-2" --no-ff -m "Merge pull request #2 from Expensify/pr-2"
info "Merged PR #2 into main"
git branch -d "pr-2"
success "Created PR #2 and merged it to main!"

success "Scenario #2 completed successfully!"

title "Scenario #3: Merge a pull request with the checklist locked and CP it to staging"

info "Creating PR #3 and merging it into main..."
git switch -c "pr-3"
echo "Changes from PR #3" >> "PR3.txt"
git add "PR3.txt"
git commit -m "Changes from PR #3"
git switch main
git merge "pr-3" --no-ff -m "Merge pull request #3 from Expensify/pr-3"
PR_MERGE_COMMIT="$(git log -1 --format='%H')"
info "Merged PR #3 into main"
git branch -d "pr-3"
success "Created PR #3 and merged it to main!"

info "Bumping version to 1.0.2 on main..."
setup_git_as_osbotify
npm --no-git-tag-version version 1.0.2 -m "Update version to 1.0.2"
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
VERSION_BUMP_COMMIT="$(git log -1 --format='%H')"
success "Bumped version to 1.0.2 on main!"

info "Cherry picking PR #3 and the version bump to staging..."
git switch staging
git switch -c cherry-pick-staging
git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs "$PR_MERGE_COMMIT"
git cherry-pick -x --mainline 1 "$VERSION_BUMP_COMMIT"
git switch staging
git merge cherry-pick-staging --no-ff -m "Merge pull request #4 from Expensify/cherry-pick-staging"
git branch -d cherry-pick-staging
info "Merged PR #4 into staging"
success "Successfully cherry-picked PR #3 to staging!"

info "Tagging the new version on staging..."
git tag "$(print_version)"
success "Created tag $(print_version)"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.0 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.0' '1.0.2')
assert_equal "$output" "[ '3', '1' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.2')
assert_equal "$output" "[ '3' ]"

success "Scenario #3 completed successfully!"


title "Scenario #4: Close the checklist"
title "Scenario #4A: Run the production deploy"

info "Recreating production from staging..."
git branch -D production
git switch -c production
success "Recreated production from staging!"

# Verify output for release body and production deploy comments
info "Checking output of getPullRequestsMergedBetween 1.0.0 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.0' '1.0.2')
assert_equal "$output" "[ '3', '1' ]"

success "Scenario #4A completed successfully!"

title "Scenario #4B: Run the staging deploy and create a new checklist"

info "Bumping version to 1.1.0 on main..."
git switch main
npm --no-git-tag-version version 1.1.0
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
success "Successfully updated version to 1.1.0 on main!"

info "Re-creating staging from main..."
git branch -D staging
git switch -c staging
success "Recreated staging from main!"

info "Tagging new version on staging..."
git tag "$(print_version)"
success "Successfully tagged version $(print_version) on staging"

# Verify output for new checklist and staging deploy comments
info "Checking output of getPullRequestsMergedBetween 1.0.2 1.1.0"
output=$(node "$getPullRequestsMergedBetween" '1.0.2' '1.1.0')
assert_equal "$output" "[ '2' ]"

success "Scenario #4B completed successfully!"


title "Scenario #5: Merging another pull request when the checklist is unlocked"

info "Creating PR #5 and merging it to main..."
setup_git_as_human
git switch main
git switch -c "pr-5"
echo "Changes from PR #5" >> "PR5.txt"
git add "PR5.txt"
git commit -m "Changes from PR #5"
git switch main
git merge "pr-5" --no-ff -m "Merge pull request #5 from Expensify/pr-5"
info "Merged PR #5 into main"
git branch -d "pr-5"
success "Created PR #5 and merged it into main!"

info "Bumping version to 1.1.1 on main..."
setup_git_as_osbotify
npm --no-git-tag-version version 1.1.1 -m "Update version to 1.1.1"
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
success "Bumped version to 1.1.1 on main!"

info "Recreating staging from main..."
git branch -D staging
git switch -c staging
success "Recreated staging from main!"

info "Tagging staging..."
git tag "$(print_version)"
success "Successfully tagged version $(print_version) on staging"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.2 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.2' '1.1.1')
assert_equal "$output" "[ '5', '2' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.1.0 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.1.0' '1.1.1')
assert_equal "$output" "[ '5' ]"

success "Scenario #6 completed successfully!"

### Cleanup
title "Cleaning up..."
cd "$TEST_DIR" || exit 1
rm -rf "$DUMMY_DIR"
success "All tests passed! Hooray!"
