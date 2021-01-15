#!/bin/bash
#
# Used to precompile all Github Action node.js scripts using ncc.
# This bundles them with their dependencies into a single executable node.js script.

declare -r NOTE_DONT_EDIT='/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
'
declare -r ACTIONS_DIR="$(dirname "$(dirname "$(realpath "$0")")")/actions"
declare -r GITHUB_ACTIONS=(
    "$ACTIONS_DIR/bumpVersion/bumpVersion.js"
)

for ACTION in "${GITHUB_ACTIONS[@]}"; do
    ACTION_DIR=$(dirname "$ACTION")
    ncc build "$ACTION" -o "$ACTION_DIR"
    OUTPUT_FILE="$ACTION_DIR/index.js"
    echo "$NOTE_DONT_EDIT$(cat "$OUTPUT_FILE")" > "$OUTPUT_FILE"
done
