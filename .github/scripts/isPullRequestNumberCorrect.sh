#!/bin/bash
set -e

EVENT_NAME=$1
NUMBER=$2
REF_NAME=$3


if [[ $EVENT_NAME == "workflow_dispatch" ]]; then
  gh pr checkout "$NUMBER"
  BRANCH_NAME=$(gh pr view --json 'headRefName' -q '.headRefName')
  if [[ $REF_NAME == "$BRANCH_NAME" ]] ; then
    echo "Pull Request number matched with the branch name!"
    echo "pullRequestNumber=$NUMBER" >> "$GITHUB_OUTPUT"
    exit 0
  else 
    echo "This number doesn't match a correct branch!"
    exit 1
  fi
else 
  echo "pullRequestNumber=$NUMBER" >> "$GITHUB_OUTPUT"
fi
  