#!/bin/bash

if [ -z "$VERSION" ]; then
    echo "VERSION env variable is not set"
    exit 1
fi

if [ -z "$PATCHES_PATHS" ]; then
    echo "PATCHES_PATHS env variable is not set"
    exit 1
fi

IFS=' ' read -ra PATCH_DIRS <<< "$PATCHES_PATHS"
find "${PATCH_DIRS[@]}" -type f -name "react-native+${VERSION}*.patch" -exec sha256sum {} + | sort | sha256sum | awk '{print $1}'
