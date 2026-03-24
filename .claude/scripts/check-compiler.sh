#!/bin/bash

# Secure proxy script to run React Compiler compliance check on a single file.
# Validates the filepath before passing it to the underlying npm script.
set -eu

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <filepath>" >&2
    exit 1
fi

readonly FILEPATH="$1"

# Strict filepath validation - reject shell metacharacters
if ! [[ "$FILEPATH" =~ ^[a-zA-Z0-9_./@-]+$ ]]; then
    echo "Error: Invalid filepath (contains disallowed characters)" >&2
    exit 1
fi

npm run react-compiler-compliance-check -- check "$FILEPATH"
