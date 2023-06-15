#!/bin/bash

# Fail immediately if there is an error thrown
set -e

TEST_DIR=$(dirname "$(dirname "$(cd "$(dirname "$0")" || exit 1;pwd)/$(basename "$0")")")
SCRIPTS_DIR="$TEST_DIR/../scripts"
DUMMY_DIR="$HOME/DumDumRepo"
getPullRequestsMergedBetween="$TEST_DIR/utils/getPullRequestsMergedBetween.mjs"

source "$SCRIPTS_DIR/shellUtils.sh"

PR_COUNT=0

function print_version {
  < package.json jq -r .version
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

info "Creating new dummy repo at $DUMMY_DIR"
mkdir "$DUMMY_DIR"
cd "$DUMMY_DIR" || exit 1
success "Successfully created dummy repo at $(pwd)"

info "Initializing npm project in $DUMMY_DIR"
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
git config user.email "test@test.com"
git config user.name "test"
git add package.json package-lock.json
git commit -m "Initial commit"

info "Bumping version to 1.0.1"
npm --no-git-tag-version version 1.0.1 -m "Update version to 1.0.1"
git add package.json package-lock.json
git commit -m "Update version to 1.0.1"

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

((PR_COUNT++))
info "Creating PR #$PR_COUNT and merging it into main..."
git switch -c "pr-$PR_COUNT"
echo "Changes from PR #$PR_COUNT" >> "PR$PR_COUNT.txt"
git add "PR$PR_COUNT.txt"
git commit -m "Changes from PR #$PR_COUNT"
success "Created PR #$PR_COUNT in branch pr-$PR_COUNT"

info "Merging PR #$PR_COUNT to main"
git switch main
git merge "pr-$PR_COUNT" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/pr-$PR_COUNT"
git branch -d "pr-$PR_COUNT"
success "Merged PR #$PR_COUNT to main"

# Bump the version to 1.0.2
info "Bumping version to 1.0.2"
npm --no-git-tag-version version 1.0.2 -m "Update version to 1.0.2"
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
git switch main
success "Created new tag $(print_version)"

# Verify output for checklist and deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.2')
assert_equal "$output" "[ '$PR_COUNT' ]"

success "Scenario #1 completed successfully!"


title "Scenario #2: Merge a pull request with the checklist locked, but don't CP it"

((PR_COUNT++))
info "Creating PR #$PR_COUNT and merging it into main..."
git switch -c "pr-$PR_COUNT"
# TODO change filename to PR_$PR_COUNT.txt
echo "Changes from PR #$PR_COUNT" >> "PR$PR_COUNT.txt"
git add "PR$PR_COUNT.txt"
git commit -m "Changes from PR #$PR_COUNT"
git switch main
git merge "pr-$PR_COUNT" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/pr-$PR_COUNT"
info "Merged PR #$PR_COUNT into main"
git branch -d "pr-$PR_COUNT"
success "Created PR #$PR_COUNT and merged it to main!"

success "Scenario #2 completed successfully!"


title "Scenario #3: Merge a pull request with the checklist locked and CP it to staging"

((PR_COUNT++))
info "Creating PR #$PR_COUNT and merging it into main..."
git switch -c "pr-$PR_COUNT"
echo "Changes from PR #$PR_COUNT" >> "PR$PR_COUNT.txt"
git add "PR$PR_COUNT.txt"
git commit -m "Changes from PR #$PR_COUNT"
git switch main
git merge "pr-$PR_COUNT" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/pr-$PR_COUNT"
PR_MERGE_COMMIT="$(git log -1 --format='%H')"
info "Merged PR #$PR_COUNT into main"
git branch -d "pr-$PR_COUNT"
success "Created PR #$PR_COUNT and merged it to main!"

info "Bumping version to 1.0.3 on main..."
npm --no-git-tag-version version 1.0.3 -m "Update version to 1.0.3"
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
VERSION_BUMP_COMMIT="$(git log -1 --format='%H')"
success "Bumped version to 1.0.3 on main!"

info "Cherry picking PR #$PR_COUNT and the version bump to staging..."
git switch staging
git switch -c cherry-pick-staging
git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs "$PR_MERGE_COMMIT"
git cherry-pick -x --mainline 1 "$VERSION_BUMP_COMMIT"
git switch staging
((PR_COUNT++))
git merge cherry-pick-staging --no-ff -m "Merge pull request #$PR_COUNT from Expensify/cherry-pick-staging"
git branch -d cherry-pick-staging
info "Merged PR #$PR_COUNT into staging"
success "Successfully cherry-picked PR #$((PR_COUNT - 1)) to staging!"

info "Tagging the new version on staging..."
git tag "$(print_version)"
success "Created tag $(print_version)"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.3"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.3')
assert_equal "$output" "[ '$PR_COUNT', '$((PR_COUNT - 1))', '$((PR_COUNT - 3))' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.2 1.0.3"
output=$(node "$getPullRequestsMergedBetween" '1.0.2' '1.0.3')
assert_equal "$output" "[ '$PR_COUNT', '$((PR_COUNT -1))' ]"

success "Scenario #3 completed successfully!"


title "Scenario #4: Close the checklist"
title "Scenario #4A: Run the production deploy"

info "Recreating production from staging..."
git branch -D production
git switch -c production
success "Recreated production from staging!"

# Verify output for release body and production deploy comments
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.3"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.3')
assert_equal "$output" "[ '$PR_COUNT', '$((PR_COUNT - 1))', '$((PR_COUNT - 3))' ]"

success "Scenario #4A completed successfully!"

title "Scenario #4B: Run the staging deploy and create a new checklist"

info "Bumping version to 1.1.0 on main..."
git switch main
npm --no-git-tag-version version 1.1.0 -m "Update version to 1.1.0"
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
info "Checking output of getPullRequestsMergedBetween 1.0.3 1.1.0"
output=$(node "$getPullRequestsMergedBetween" '1.0.3' '1.1.0')
assert_equal "$output" "[ '$((PR_COUNT - 2))' ]"

success "Scenario #4B completed successfully!"


title "Scenario #5: Merging another pull request when the checklist is unlocked"

((PR_COUNT++))
info "Creating PR #$PR_COUNT and merging it to main..."
git switch main
git switch -c "pr-$PR_COUNT"
echo "Changes from PR #$PR_COUNT" >> "PR$PR_COUNT.txt"
git add "PR$PR_COUNT.txt"
git commit -m "Changes from PR #$PR_COUNT"
git switch main
git merge "pr-$PR_COUNT" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/pr-$PR_COUNT"
info "Merged PR #$PR_COUNT into main"
git branch -d "pr-$PR_COUNT"
success "Created PR #$PR_COUNT and merged it into main!"

info "Bumping version to 1.1.1 on main..."
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
info "Checking output of getPullRequestsMergedBetween 1.0.3 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.3' '1.1.1')
assert_equal "$output" "[ '$PR_COUNT' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.1.0 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.1.0' '1.1.1')
assert_equal "$output" "[ '$PR_COUNT' ]"

success "Scenario #6 completed successfully!"

### Cleanup
title "Cleaning up..."
cd "$TEST_DIR" || exit 1
rm -rf "$DUMMY_DIR"
success "All tests passed! Hooray!"
