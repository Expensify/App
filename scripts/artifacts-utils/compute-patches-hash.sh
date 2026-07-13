#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/../shellUtils.sh"

PATCH_DIRS=("$@")

if [ ${#PATCH_DIRS[@]} -eq 0 ]; then
    error "At least one patch directory argument is required"
    exit 1
fi

PATCHES_HASH=$(find "${PATCH_DIRS[@]}" -type f \( -name "react-native+*.patch" -o -name "@react-native+*.patch" \) -exec sha256sum {} \; | awk '{split($2, pathParts, "/"); print pathParts[length(pathParts)], $1 }' | sort | sha256sum | awk '{print $1}')

echo "$PATCHES_HASH"
