#!/bin/bash

# Fail immediately if there is an error thrown
set -e

TEST_DIR=$(dirname "$(dirname "$(cd "$(dirname "$0")" || exit 1;pwd)/$(basename "$0")")")
DUMMY_DIR="$HOME/DumDumRepo"
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

# Verify output for checklist and deploy comment
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
git branch -d version-bump
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

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.1.0"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.1.0')
assert_equal "$output" "[ '1' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.2 1.1.0"
output=$(node "$getPullRequestsMergedBetween" '1.0.2' '1.1.0')
assert_equal "$output" "[]"

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
PR_7_MERGE_COMMIT="$(git log -1 --format='%H')"
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
VERSION_BUMP_MERGE_COMMIT="$(git log -1 --format='%H')"
info "Merged PR #8 into main"
git branch -d version-bump
success "Bumped version to 1.1.1 on main!"

info "Cherry picking PR #7 and the version bump to staging..."
git checkout staging
git checkout -b cherry-pick-staging-7
git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs "$PR_7_MERGE_COMMIT"
git cherry-pick -x --mainline 1 "$VERSION_BUMP_MERGE_COMMIT"
git checkout staging
git merge cherry-pick-staging-7 --no-ff -m "Merge pull request #9 from Expensify/cherry-pick-staging-7"
git branch -d cherry-pick-staging-7
info "Merged PR #9 into staging"
success "Successfully cherry-picked PR #7 to staging!"

info "Tagging the new version on staging..."
git checkout staging
git tag "$(print_version)"
success "Created tag $(print_version)"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.1.1')
assert_equal "$output" "[ '9', '7', '1' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.1.0 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.1.0' '1.1.1')
assert_equal "$output" "[ '9', '7' ]"

success "Scenario #4 completed successfully!"


title "Scenario #5: Close the checklist"
title "Scenario #5A: Run the production deploy"

info "Updating production from staging..."
git checkout production
git checkout -b update-production-from-staging
git merge --no-edit -Xtheirs staging
git checkout production
git merge update-production-from-staging --no-ff -m "Merge pull request #10 from Expensify/update-production-from-staging"
info "Merged PR #10 into production"
git branch -d update-production-from-staging
success "Updated production from staging!"

# Verify output for release body and production deploy comments
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.1.1')
assert_equal "$output" "[ '9', '7', '1' ]"

success "Scenario #5A completed successfully!"

title "Scenario #5B: Run the staging deploy and create a new checklist"

info "Bumping version to 1.1.2 on main..."
git checkout main
git checkout -b version-bump
npm --no-git-tag-version version 1.1.2 -m "Update version to 1.1.2"
git add package.json package-lock.json
git commit -m "Update version to $(print_version)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #11 from Expensify/version-bump"
info "Merged PR #11 into main"
git branch -d version-bump
success "Successfully updated version to 1.1.2 on main!"

info "Updating staging from main..."
git checkout staging
git checkout -b update-staging-from-main
git merge --no-edit -Xtheirs main
git checkout staging
git merge update-staging-from-main --no-ff -m "Merge pull request #12 from Expensify/update-staging-from-main"
info "Merged PR #12 into staging"
git branch -d update-staging-from-main
success "Successfully updated staging from main!"

info "Tagging new version on staging..."
git checkout staging
git tag "$(print_version)"
success "Successfully tagged version $(print_version) on staging"

# Verify output for new checklist and staging deploy comments
info "Checking output of getPullRequestsMergedBetween 1.1.1 1.1.2"
output=$(node "$getPullRequestsMergedBetween" '1.1.1' '1.1.2')
assert_equal "$output" "[ '6' ]"

success "Scenario #5B completed successfully!"


title "Scenario #6: Merging another pull request when the checklist is unlocked"

info "Creating PR #13 and merging it to main..."
git checkout main
git checkout -b pr-13
echo "Changes from PR #13" >> PR13.txt
git add PR13.txt
git commit -m "Changes from PR #13"
git checkout main
git merge pr-13 --no-ff -m "Merge pull request #13 from Expensify/pr-13"
info "Merged PR #13 into main"
git branch -d pr-13
success "Created PR #13 and merged it into main!"

info "Bumping version to 1.1.3 on main..."
git checkout main
git checkout -b version-bump
npm --no-git-tag-version version 1.1.3 -m "Update version to 1.1.3"
git add package.json package-lock.json
git commit -m "Update version to $(cat package.json | jq -r .version)"
git checkout main
git merge version-bump --no-ff -m "Merge pull request #14 from Expensify/version-bump"
info "Merged PR #14 into main"
git branch -d version-bump
success "Bumped version to 1.1.3 on main!"

info "Merging main into staging..."
git checkout staging
git checkout -b update-staging-from-main
git merge --no-edit -Xtheirs main
git checkout staging
git merge update-staging-from-main --no-ff -m "Merge pull request #15 from Expensify/update-staging-from-main"
info "Merged PR #15 into staging"
git branch -d update-staging-from-main
success "Merged main into staging!"

info "Tagging staging..."
git checkout staging
git tag "$(print_version)"
success "Successfully tagged version $(print_version) on staging"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.1.1 1.1.3"
output=$(node "$getPullRequestsMergedBetween" '1.1.1' '1.1.3')
assert_equal "$output" "[ '13', '6' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.1.2 1.1.3"
output=$(node "$getPullRequestsMergedBetween" '1.1.2' '1.1.3')
assert_equal "$output" "[ '13' ]"

success "Scenario #6 completed successfully!"

### Cleanup
title "Cleaning up..."
cd "$TEST_DIR" || exit 1
rm -rf "$DUMMY_DIR"
success "All tests passed! Hooray!"
