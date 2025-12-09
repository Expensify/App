#!/bin/bash

# Add a +1 reaction to a GitHub PR
# 
# This script provides a secure, minimal-permissions way to add approval reactions
# to pull requests. It's designed for use by review agents that find no violations
# to signal successful completion without creating unnecessary comments.
#
# USAGE:
#   addPrReaction.sh <PR_NUMBER>
#
# EXAMPLE:
#   addPrReaction.sh 12345
#
# REQUIREMENTS:
#   - gh CLI must be installed and authenticated
#   - GITHUB_REPOSITORY environment variable must be set (automatically set in GitHub Actions)
#
# SECURITY:
#   - Only adds reactions (no write/modify permissions needed)
#   - Always adds "+1" reaction (thumbs up) - no custom input
#
# NOTE:
#   This script intentionally does NOT accept a reaction type parameter.
#   It always adds a "+1" reaction for consistency and security.

set -eu

if [[ $# -lt 1 ]] || ! [[ "$1" =~ ^[0-9]+$ ]]; then
    echo "Usage: $0 <PR_NUMBER>" >&2
    echo "Example: $0 12345" >&2
    exit 1
fi

PR_NUMBER="$1"
REPO="${GITHUB_REPOSITORY}"

gh api -X POST "/repos/$REPO/issues/$PR_NUMBER/reactions" -f content="+1"

