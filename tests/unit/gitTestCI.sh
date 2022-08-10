#!/bin/bash

# Fail immediately if there is an error thrown
set -e

TEST_DIR=$(dirname "$(dirname "$(cd "$(dirname "$0")" || exit 1;pwd)/$(basename "$0")")")
SCRIPTS_DIR="$TEST_DIR/../scripts"
DUMMY_DIR="$HOME/DumDumRepo"
getPullRequestsMergedBetween="$TEST_DIR/utils/getPullRequestsMergedBetween.mjs"

source "$SCRIPTS_DIR/shellUtils.sh"

PR_COUNT=0

### Utility functions

function print_version {
  < package.json  jq -r .version
}

# Bump the package version on main
# @param $1 – the new package version
# @param $2 – Pass --keep-version-branch to skip deleting the version bump branch
function bump_version {
  info "Bumping version to $1"
  git checkout main
  git checkout -b version-bump
  npm --no-git-tag-version version "$1" -m "Update version to $1"
  git add package.json package-lock.json
  git commit -m "Update version to $(print_version)"
  git checkout main
  git merge version-bump --no-ff -m "Merge pull request #$((++PR_COUNT)) from Expensify/version-bump"
  info "Merged PR #$PR_COUNT to main"
  if [[ "$2" != '--keep-version-branch' ]]; then
    git branch -d version-bump
  fi
  success "Version bumped to $(print_version) on main"
}

function tag_staging {
  info "Tagging new version..."
  git checkout staging
  git tag "$(print_version)"
  success "Created new tag $(print_version)"
}

# Update staging or production branch
# @param $1 – the name of the branch to update
function update_protected_branch {
  TARGET_BRANCH="$1"
  [[ $TARGET_BRANCH = 'staging' ]] && SOURCE_BRANCH='main' || SOURCE_BRANCH='staging'
  UPDATE_BRANCH="update-$TARGET_BRANCH-from-$SOURCE_BRANCH"
  info "Merging $SOURCE_BRANCH into $TARGET_BRANCH..."
  git checkout "$TARGET_BRANCH"
  git checkout -b "$UPDATE_BRANCH"
  git merge --no-edit -Xtheirs "$SOURCE_BRANCH" || { git diff --name-only --diff-filter=U | xargs git rm; git -c core.editor=true merge --continue; }
  git checkout "$TARGET_BRANCH"
  git merge "$UPDATE_BRANCH" --no-ff -m "Merge pull request #$((++PR_COUNT)) from Expensify/$UPDATE_BRANCH"
  info "Merged PR #$PR_COUNT to staging"
  git branch -d "$UPDATE_BRANCH"
  success "Merged $SOURCE_BRANCH into $TARGET_BRANCH"
}

# CP a PR
# @param $1 – the number of a PR to "cherry-pick" to staging
function cherry_pick {
  info "Cherry picking PR #$1 and the version bump to staging..."

  SOURCE_BRANCH="pr-$1"
  SOURCE_HEAD=$(git show-ref --verify "refs/heads/$SOURCE_BRANCH" | grep -o '^\S*')
  SOURCE_MERGE_COMMIT=$(git log --merges --format="%H %P" | grep "$SOURCE_HEAD" | grep -o '^\S*')
  SOURCE_MERGE_BASE=$(git merge-base staging "$SOURCE_MERGE_COMMIT")

  VERSION_BUMP_HEAD=$(git show-ref --verify refs/heads/version-bump | grep -o '^\S*')
  VERSION_BUMP_MERGE_COMMIT=$(git log --merges --format="%H %P" | grep "$VERSION_BUMP_HEAD" | grep -o '^\S*')
  VERSION_BUMP_MERGE_BASE=$(git merge-base staging "$VERSION_BUMP_MERGE_COMMIT")

  CP_BRANCH="cherry-pick-staging-$1"
  CP_MERGE_BASE=$(git merge-base "$SOURCE_MERGE_BASE" "$VERSION_BUMP_MERGE_BASE")
  git checkout -b "$CP_BRANCH" "$CP_MERGE_BASE"

  git cherry-pick -x --mainline 1 -Xtheirs "$SOURCE_MERGE_COMMIT"
  git cherry-pick -x --mainline 1 -Xtheirs "$VERSION_BUMP_MERGE_COMMIT"

  git checkout main
  git merge --no-ff --no-edit "$CP_BRANCH" -m "Merge pull request #$((++PR_COUNT)) from Expensify/$CP_BRANCH" || { git diff --name-only --diff-filter=U | xargs git rm; git -c core.editor=true merge --continue; }
  info "Merged PR #$PR_COUNT into main"

  git checkout staging
  git merge --no-ff --no-edit -Xtheirs "$CP_BRANCH" -m "Merge pull request #$((++PR_COUNT)) from Expensify/$CP_BRANCH" || { git diff --name-only --diff-filter=U | xargs git rm; git -c core.editor=true merge --continue; }
  info "Merged PR #$PR_COUNT into staging"

  git branch -d "$CP_BRANCH"
  git checkout main
  git branch -d "$SOURCE_BRANCH"
  git branch -d version-bump
  success "Successfully cherry-picked PR #$1 to staging!"
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
git add package-lock.json
git commit -m "Update version to 1.0.1"

info "Creating branches..."
git checkout -b staging
git checkout -b production
git checkout main
success "Initialized Git repo!"

tag_staging

success "Setup complete!"


title "Scenario #1: Merge a pull request while the checklist is unlocked"

# Create PR 1, merge that PR to main.
info "Creating PR #$((++PR_COUNT))"
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
FILE_NAME="PR_$PR_COUNT.txt"
git checkout -b "$BRANCH_NAME"
echo "Changes from PR #$PR_COUNT" >> "$FILE_NAME"
git add "$FILE_NAME"
git commit -m "Changes from PR #$PR_COUNT"
success "Created PR #$PR_COUNT in branch $BRANCH_NAME"

info "Merging PR #$PR_COUNT to main"
git checkout main
git merge "$BRANCH_NAME" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
git branch -d "$BRANCH_NAME"
success "Merged PR #$PR_COUNT to main"

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$PR_COUNT"
PREVIOUS_PR=$PR_COUNT

bump_version '1.0.2'
update_protected_branch 'staging'
tag_staging

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$PREVIOUS_PR"

# Verify output for checklist and deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.2"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.2')
assert_equal "$output" "[ '1' ]"

success "Scenario #1 completed successfully!"


title "Scenario #2: Merge a pull request with the checklist locked, but don't CP it"

info "Creating PR #$((++PR_COUNT)) and merging it into main..."
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
FILE_NAME="PR_$PR_COUNT.txt"
git checkout -b "$BRANCH_NAME"
echo "Changes from PR #$PR_COUNT" >> "$FILE_NAME"
git add "$FILE_NAME"
git commit -m "Changes from PR #$PR_COUNT"
git checkout main
git merge "$BRANCH_NAME" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
info "Merged PR #$PR_COUNT into main"
git branch -d "$BRANCH_NAME"
success "Created PR #$PR_COUNT and merged it to main!"

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$PR_COUNT"
git checkout staging
assert_string_doesnt_contain_substring "$(cat $FILE_NAME)" "Changes from PR #$PR_COUNT"

success "Scenario #2 completed successfully!"


title "Scenario #3: Merge a pull request with the checklist locked and CP it to staging"

PREVIOUS_PR=$PR_COUNT
CP_PR=$((++PR_COUNT))
info "Creating PR #$PR_COUNT and merging it into main..."
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
FILE_NAME="PR_$PR_COUNT.txt"
git checkout -b "$BRANCH_NAME"
echo "Changes from PR #$PR_COUNT" >> "$FILE_NAME"
git add "$FILE_NAME"
git commit -m "Changes from PR #$PR_COUNT"
git checkout main
git merge "$BRANCH_NAME" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
info "Merged PR #$PR_COUNT into main"
success "Created PR #$PR_COUNT and merged it to main!"

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$CP_PR"

bump_version '1.0.3' --keep-version-branch
cherry_pick 5
tag_staging

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$CP_PR"
assert_file_doesnt_exist "PR_$PREVIOUS_PR.txt"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.3"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.3')
assert_equal "$output" "[ '8', '5', '1' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.0.2 1.0.3"
output=$(node "$getPullRequestsMergedBetween" '1.0.2' '1.0.3')
assert_equal "$output" "[ '8', '5' ]"

success "Scenario #3 completed successfully!"


title "Scenario #4: Close the checklist"
title "Scenario #4A: Run the production deploy"

update_protected_branch 'production'

assert_string_contains_substring "$(cat PR_1.txt)" "Changes from PR #1"
assert_string_contains_substring "$(cat PR_5.txt)" "Changes from PR #5"
assert_file_doesnt_exist "PR_4.txt"

# Verify output for release body and production deploy comments
info "Checking output of getPullRequestsMergedBetween 1.0.1 1.0.3"
output=$(node "$getPullRequestsMergedBetween" '1.0.1' '1.0.3')
assert_equal "$output" "[ '8', '5', '1' ]"

success "Scenario #4A completed successfully!"

title "Scenario #4B: Run the staging deploy and create a new checklist"

bump_version '1.1.0'
update_protected_branch 'staging'
tag_staging

assert_string_contains_substring "$(cat PR_4.txt)" "Changes from PR #4"

# Verify output for new checklist and staging deploy comments
info "Checking output of getPullRequestsMergedBetween 1.0.3 1.1.0"
output=$(node "$getPullRequestsMergedBetween" '1.0.3' '1.1.0')
assert_equal "$output" "[ '7', '4' ]"

success "Scenario #4B completed successfully!"


title "Scenario #5: Merging another pull request when the checklist is unlocked"

info "Creating PR #$((++PR_COUNT)) and merging it to main..."
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
FILE_NAME="PR_$PR_COUNT.txt"
git checkout -b "$BRANCH_NAME"
echo "Changes from PR #$PR_COUNT" >> "$FILE_NAME"
git add "$FILE_NAME"
git commit -m "Changes from PR #$PR_COUNT"
git checkout main
git merge "$BRANCH_NAME" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
info "Merged PR #$PR_COUNT into main"
git branch -d "$BRANCH_NAME"
success "Created PR #$PR_COUNT and merged it into main!"

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$PR_COUNT"
PREVIOUS_PR=$PR_COUNT

bump_version '1.1.1'
update_protected_branch 'staging'
tag_staging

assert_string_contains_substring "$(cat $FILE_NAME)" "Changes from PR #$PREVIOUS_PR"

# Verify output for checklist
info "Checking output of getPullRequestsMergedBetween 1.0.3 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.0.3' '1.1.1')
assert_equal "$output" "[ '12', '7', '4' ]"

# Verify output for deploy comment
info "Checking output of getPullRequestsMergedBetween 1.1.0 1.1.1"
output=$(node "$getPullRequestsMergedBetween" '1.1.0' '1.1.1')
assert_equal "$output" "[ '12' ]"

success "Scenario #5 completed successfully!"


title "Scenario #6: Cherry-picking a revert"

info "Creating PR #$((++PR_COUNT)) and merging it to main..."
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
FILE_NAME="PR_$PR_COUNT.txt"
git checkout -b "$BRANCH_NAME"
echo "some content" >> $FILE_NAME
git add $FILE_NAME
git commit -m "Create $FILE_NAME"
git checkout main
git merge "$BRANCH_NAME" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
git branch -d $BRANCH_NAME
success "Merged PR #$PR_COUNT into main!"

assert_string_contains_substring "$(cat $FILE_NAME)" "some content"

bump_version '1.1.2'
update_protected_branch 'staging'
tag_staging

assert_string_contains_substring "$(cat $FILE_NAME)" "some content"

info "Creating PR #$((++PR_COUNT)) and merging it to main..."
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
git checkout -b "$BRANCH_NAME"
printf "Prepended content\n\n%s" "$(cat "$FILE_NAME")" > $FILE_NAME
printf "\nAppended content\n" >> $FILE_NAME
git add $FILE_NAME
git commit -m "Prepend and append content to $FILE_NAME"
git checkout main
git merge $BRANCH_NAME --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
git branch -d $BRANCH_NAME
success "Merged PR #$PR_COUNT into main!"

info "Asserting that prepended content, original content, and appended content are present on main"
git checkout main
assert_string_contains_substring "$(cat $FILE_NAME)" "Prepended content"
assert_string_contains_substring "$(cat $FILE_NAME)" "some content"
assert_string_contains_substring "$(cat $FILE_NAME)" "Appended content"

bump_version '1.1.3'
update_protected_branch 'staging'
tag_staging

info "Asserting that prepended content, original content, and appended content are present on staging"
git checkout staging
assert_string_contains_substring "$(cat $FILE_NAME)" "Prepended content"
assert_string_contains_substring "$(cat $FILE_NAME)" "some content"
assert_string_contains_substring "$(cat $FILE_NAME)" "Appended content"

info "Creating PR #$((++PR_COUNT)) to revert the append and prepend..."
git checkout main
BRANCH_NAME="pr-$PR_COUNT"
git checkout -b "$BRANCH_NAME"
echo "some content" > $FILE_NAME
git add $FILE_NAME
git commit -m "Revert PR"
git checkout main
git merge $BRANCH_NAME --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
info "Merged PR #$PR_COUNT into main"

info "Asserting that PR is reverted on main"
git checkout main
assert_string_doesnt_contain_substring "$(cat $FILE_NAME)" "Prepended content"
assert_string_contains_substring "$(cat $FILE_NAME)" "some content"
assert_string_doesnt_contain_substring "$(cat $FILE_NAME)" "Appended content"

PREVIOUS_PR=$PR_COUNT
bump_version '1.1.4' --keep-version-branch
cherry_pick "$PREVIOUS_PR"
tag_staging

info "Asserting that PR is reverted on staging"
assert_string_doesnt_contain_substring "$(cat $FILE_NAME)" "Prepended content"
assert_string_contains_substring "$(cat $FILE_NAME)" "some content"
assert_string_doesnt_contain_substring "$(cat $FILE_NAME)" "Appended content"

info "Repeating previously reverted PR..."
git checkout main
BRANCH_NAME="pr-$((++PR_COUNT))"
git checkout -b "$BRANCH_NAME"
printf "Prepended content\n\n%s" "$(cat $FILE_NAME)" > $FILE_NAME
printf "\nAppended content\n" >> $FILE_NAME
git add $FILE_NAME
git commit -m "Prepend and append content to $FILE_NAME"
git checkout main
git merge "$BRANCH_NAME" --no-ff -m "Merge pull request #$PR_COUNT from Expensify/$BRANCH_NAME"
git branch -d "$BRANCH_NAME"
success "Merged PR #22 into main!"

info "Asserting that prepended content, original content, and appended content are present on main"
git checkout main
assert_string_contains_substring "$(cat $FILE_NAME)" "Prepended content"
assert_string_contains_substring "$(cat $FILE_NAME)" "some content"
assert_string_contains_substring "$(cat $FILE_NAME)" "Appended content"

bump_version '1.1.5'
update_protected_branch 'staging'
tag_staging

info "Asserting that prepended content, original content, and appended content are present on staging"
assert_string_contains_substring "$(cat $FILE_NAME)" "Prepended content"
assert_string_contains_substring "$(cat $FILE_NAME)" "some content"
assert_string_contains_substring "$(cat $FILE_NAME)" "Appended content"

success "Scenario #6 completed successfully!"

### Cleanup
title "Cleaning up..."
cd "$TEST_DIR" || exit 1
rm -rf "$DUMMY_DIR"
success "All tests passed! Hooray!"
