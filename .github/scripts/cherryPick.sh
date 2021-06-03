#!/bin/bash
#
# Used to cherry-pick a pull request merge commit

echo "Attempting to cherry-pick $1"

if git cherry-pick -x --mainline 1 "$1"; then
  echo "No conflicts!"
  exit 0
else
  echo "There are conflicts in the following files:"
  git --no-pager diff --name-only --diff-filter=U

  # Just add the unresolved conflicts and continue
  git add .
  GIT_MERGE_AUTOEDIT=no git cherry-pick --continue

  exit 1
fi
