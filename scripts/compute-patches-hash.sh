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
PATCHES_HASH=$(find "${PATCH_DIRS[@]}" -type f \( -name "react-native+*.patch" -o -name "@react-native+*.patch" \) -exec sha256sum {} \; | awk '{split($2, pathParts, "/"); print pathParts[length(pathParts)], $1 }' | sort | sha256sum | awk '{print $1}')

# Include hermesV1Enabled flag in the hash so that enabling Hermes V1 invalidates
# prebuilt artifacts and triggers a build from source.
ANDROID_GRADLE_PROPS="$SCRIPT_DIR/../android/gradle.properties"

if [ -f "$ANDROID_GRADLE_PROPS" ] && grep -q '^[[:space:]]*hermesV1Enabled[[:space:]]*=[[:space:]]*true' "$ANDROID_GRADLE_PROPS"; then
    PATCHES_HASH=$(printf "%s" "${PATCHES_HASH}-hermesV1" | sha256sum | awk '{print $1}')
fi

echo "$PATCHES_HASH"
