#!/bin/bash

# Body only as an argument and PR number from the workflow, so the review agent can't post file contents or target other PRs.
set -eu

if [[ $# -ne 1 || -z "$1" ]]; then
    echo "Usage: $0 <body>" >&2
    exit 1
fi

if ! [[ "${PR_NUMBER:-}" =~ ^[0-9]+$ ]]; then
    echo "Error: PR_NUMBER must be set to a positive integer" >&2
    exit 1
fi

gh pr comment "$PR_NUMBER" --body "$1"
