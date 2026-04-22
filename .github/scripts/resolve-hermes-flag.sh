#!/bin/bash

# Resolves the hermes flag argument ("--hermes-v1" or empty) for a given
# platform and build type by inspecting the relevant config file
# (gradle.properties for Android, Podfile for iOS). Used by CI workflows
# to forward the right flag to compute-patches-hash.sh.

set -euo pipefail

source scripts/shellUtils.sh

PLATFORM="${1:-}"
BUILD_TYPE="${2:-}"

case "$PLATFORM:$BUILD_TYPE" in
    android:standalone) FILE="android/gradle.properties" ;;
    android:hybrid)     FILE="Mobile-Expensify/Android/gradle.properties" ;;
    ios:standalone)     FILE="ios/Podfile" ;;
    ios:hybrid)         FILE="Mobile-Expensify/iOS/Podfile" ;;
    *) error "Usage: $0 <android|ios> <standalone|hybrid>"; exit 1 ;;
esac

if [[ ! -f "$FILE" ]]; then
    error "Config file not found: $FILE"
    exit 1
fi

case "$PLATFORM" in
    android) PATTERN='^[[:space:]]*hermesV1Enabled[[:space:]]*=[[:space:]]*true' ;;
    ios)     PATTERN="^[[:space:]]*[^#[:space:]].*RCT_HERMES_V1_ENABLED[[:space:]]*=[[:space:]]*'1'" ;;
esac

if grep -Eq "$PATTERN" "$FILE"; then
    echo "--hermes-v1"
fi
