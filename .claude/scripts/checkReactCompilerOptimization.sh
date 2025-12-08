#!/bin/bash

# Check React Compiler optimization status for a file and its imported components.
# Usage: checkReactCompilerOptimization.sh <file-path>

set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <file-path>" >&2
    exit 1
fi

FILE_PATH="$1"

if [[ ! -f "$FILE_PATH" ]]; then
    echo "File not found: $FILE_PATH" >&2
    exit 1
fi

node "$SCRIPT_DIR/checkReactCompilerOptimization.js" "$FILE_PATH"
