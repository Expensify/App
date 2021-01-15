#!/bin/bash
#
# This script lists all our custom Github Actions that need to be compiled or verified.

# In order for this script to be safely run from anywhere, we cannot use the raw relative path '../actions'
declare -r ACTIONS_DIR="$(dirname "$(dirname "$(realpath "$0")")")/actions"

# List of paths to all JS files that implement our GH Actions
declare -r GITHUB_ACTIONS=(
    "$ACTIONS_DIR/bumpVersion/bumpVersion.js"
)

# List the actions
echo "${GITHUB_ACTIONS[@]}"
