#!/bin/bash
#
# Used to precompile all Github Action node.js scripts using ncc.
# This bundles them with their dependencies into a single executable node.js script.

# This will be inserted at the top of all compiled files as a warning to devs.
declare -r NOTE_DONT_EDIT='/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
'

# Get the list of Github Actions using ./listActions.sh
GITHUB_ACTIONS=( "$("$(dirname "$(realpath "$0")")/listActions.sh")" )

for ACTION in "${GITHUB_ACTIONS[@]}"; do
    # Build the action
    ACTION_DIR=$(dirname "$ACTION")
    ncc build "$ACTION" -o "$ACTION_DIR"

    # Prepend the warning note to the top of the compiled file
    OUTPUT_FILE="$ACTION_DIR/index.js"
    echo "$NOTE_DONT_EDIT$(cat "$OUTPUT_FILE")" > "$OUTPUT_FILE"
done
