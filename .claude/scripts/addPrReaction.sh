#!/bin/bash

# Secure proxy script to add a +1 reaction to a GitHub PR
set -eu

if [[ $# -lt 1 ]] || ! [[ "$1" =~ ^[0-9]+$ ]]; then
    echo "Usage: $0 <PR_NUMBER>" >&2
    exit 1
fi

readonly PR_NUMBER="$1"
readonly REPO="${GITHUB_REPOSITORY}"

gh api -X POST "/repos/$REPO/issues/$PR_NUMBER/reactions" -f content="+1"

