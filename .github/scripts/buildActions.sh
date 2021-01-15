#!/bin/bash
#
# Used to precompile all Github Action node.js scripts using ncc.
# This bundles them with their dependencies into a single executable node.js script.

# Get a reference to the parent directory
# In order for the script to be runnable from anywhere, don't use relative path like '../'
declare -r PARENT_DIR=$(dirname "$(realpath "$0")")

# This will be inserted at the top of all compiled files as a warning to devs.
NOTE_DONT_EDIT=$("$PARENT_DIR/generateWarningNote.sh")

# Get the list of Github Actions using ./listActions.sh
GITHUB_ACTIONS=( "$("$PARENT_DIR/listActions.sh")" )

for ACTION in "${GITHUB_ACTIONS[@]}"; do
    # Build the action
    ACTION_DIR=$(dirname "$ACTION")
    ncc build "$ACTION" -o "$ACTION_DIR"

    # Prepend the warning note to the top of the compiled file
    OUTPUT_FILE="$ACTION_DIR/index.js"
    echo "$NOTE_DONT_EDIT$(cat "$OUTPUT_FILE")" > "$OUTPUT_FILE"
done
