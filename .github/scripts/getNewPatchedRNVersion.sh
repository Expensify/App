#!/bin/bash

if [ -z "$GITHUB_TOKEN" ]; then
    echo "GITHUB_TOKEN env variable is not set"
    exit 1
fi

if [[ "$IS_HYBRID_BUILD" == "true" ]]; then
    readonly PACKAGE="react-hybrid"
else
    readonly PACKAGE="react-standalone"
fi

VERSION="$(jq -r '.dependencies["react-native"]' package.json)"
readonly VERSION

# List all versions of the package
PACKAGE_VERSIONS="$(gh api "/orgs/Expensify/packages/maven/com.expensify.${PACKAGE}.react-android/versions" --paginate --jq '.[].name')"

# Filter only versions matching the base React Native version
PACKAGE_VERSIONS="$(echo "$PACKAGE_VERSIONS" | grep "$VERSION")"

# Grab the highest patch version from there
LATEST_PATCHED_VERSION="$(echo "$PACKAGE_VERSIONS" | sort | tail -n1)"

if [[ -n "$LATEST_PATCHED_VERSION" ]]; then
    PATCH_ITERATION=${LATEST_PATCHED_VERSION##*-}
    INCREMENTED_PATCH_ITERATION=$((PATCH_ITERATION + 1))
    echo "${VERSION}-${INCREMENTED_PATCH_ITERATION}"
else
    echo "$VERSION-0"
fi
