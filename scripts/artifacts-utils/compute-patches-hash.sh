#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/../shellUtils.sh"

HERMES_V1=false
PATCH_DIRS=()
for arg in "$@"; do
    case "$arg" in
        --hermes-v1) HERMES_V1=true ;;
        *) PATCH_DIRS+=("$arg") ;;
    esac
done

if [ ${#PATCH_DIRS[@]} -eq 0 ]; then
    error "At least one patch directory argument is required"
    exit 1
fi

PATCHES_HASH=$(find "${PATCH_DIRS[@]}" -type f \( -name "react-native+*.patch" -o -name "@react-native+*.patch" \) -exec sha256sum {} \; | awk '{split($2, pathParts, "/"); print pathParts[length(pathParts)], $1 }' | sort | sha256sum | awk '{print $1}')

if [[ "$HERMES_V1" == "true" ]]; then
    PATCHES_HASH=$(printf "%s" "${PATCHES_HASH}-hermesV1" | sha256sum | awk '{print $1}')
fi

echo "$PATCHES_HASH"
