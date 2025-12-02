#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/shellUtils.sh"

if [ $# -eq 0 ]; then
    error "Please provide at least one path as an argument"
    exit 1
fi

PATCH_DIRS=("$@")
readonly PATCH_DIRS

# Find all patches, compute their hash, put filename before hash, sort, compute hash of hashes
find "${PATCH_DIRS[@]}" -type f \( -name "react-native+*.patch" -o -name "@react-native+*.patch" \) -exec sha256sum {} \; | awk '{split($2, pathParts, "/"); print pathParts[length(pathParts)], $1 }' | sort | sha256sum | awk '{print $1}'
