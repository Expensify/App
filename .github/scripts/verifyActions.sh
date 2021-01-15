#!/bin/bash

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NO_COLOR='\033[0m'

# Get a reference to the parent directory
# In order for the script to be runnable from anywhere, don't use relative path like '../'
declare -r PARENT_DIR=$(dirname "$(realpath "$0")")

# This is inserted at the top of all compiled files as a warning to devs.
NOTE_DONT_EDIT=$("$PARENT_DIR/generateWarningNote.sh")

# Get the list of Github Actions using ./listActions.sh
GITHUB_ACTIONS=( "$("$(dirname "$(realpath "$0")")/listActions.sh")" )

for ACTION in "${GITHUB_ACTIONS[@]}"; do
    # Build the action to a temp directory
    ACTION_DIR=$(dirname "$ACTION")
    ACTION_DIR_TEMP="$ACTION_DIR/temp"
    mkdir "$ACTION_DIR_TEMP"
    ncc build "$ACTION" -o "$ACTION_DIR_TEMP"

    # Prepend the warning note to the top of the compiled file
    OUTPUT_FILE="$ACTION_DIR_TEMP/index.js"
    echo "$NOTE_DONT_EDIT$(cat "$OUTPUT_FILE")" > "$OUTPUT_FILE"

    cmp "$ACTION_DIR/index.js" "$ACTION_DIR_TEMP/index.js"

    # Make sure that the recompiled version of the file matches the pre-committed version
    if [[ $(cmp --silent "$ACTION_DIR/index.js" "$ACTION_DIR_TEMP/index.js") ]]; then
        echo -e "${GREEN}Success! Files are identical!${NO_COLOR}"
        rm -rf "$ACTION_DIR_TEMP"
        exit 0
    else
        echo -e "${RED}Error: Found difference between committed files and recompiled files.\n${NO_COLOR}Did you forget to run \`npm run gh-actions-build\`?"
        rm -rf "$ACTION_DIR_TEMP"
        exit 1
    fi
done
