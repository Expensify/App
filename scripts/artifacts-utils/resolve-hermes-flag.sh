#!/bin/bash

# Resolves the hermes flag argument ("--hermes-v1" or empty) for a given
# platform and build type, based on the relevant config file
# (gradle.properties for Android, Podfile for iOS).
#
# Used by CI workflows to forward the right flag to compute-patches-hash.sh.
#
# Usage: resolve-hermes-flag.sh <android|ios> <standalone|hybrid>

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/../shellUtils.sh"

PLATFORM="${1:-}"
BUILD_TYPE="${2:-}"

case "$PLATFORM:$BUILD_TYPE" in
    android:standalone)
        FILE="android/gradle.properties"
        PATTERN='^[[:space:]]*hermesV1Enabled[[:space:]]*=[[:space:]]*true'
        ;;
    android:hybrid)
        FILE="Mobile-Expensify/Android/gradle.properties"
        PATTERN='^[[:space:]]*hermesV1Enabled[[:space:]]*=[[:space:]]*true'
        ;;
    ios:standalone)
        FILE="ios/Podfile"
        PATTERN="RCT_HERMES_V1_ENABLED.*=.*'1'"
        ;;
    ios:hybrid)
        FILE="Mobile-Expensify/iOS/Podfile"
        PATTERN="RCT_HERMES_V1_ENABLED.*=.*'1'"
        ;;
    *)
        error "Usage: $0 <android|ios> <standalone|hybrid>"
        exit 1
        ;;
esac

if grep -q "$PATTERN" "$FILE" 2>/dev/null; then
    echo "--hermes-v1"
fi
