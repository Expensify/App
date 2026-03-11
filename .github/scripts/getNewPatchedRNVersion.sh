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

# Artifact IDs follow the naming convention from official React Native packages on Maven Central:
#   react-android          - Android AAR artifacts (com.facebook.react:react-android)
#   react-native-artifacts - iOS xcframework tarballs (com.facebook.react:react-native-artifacts)
if [[ "$ARTIFACT_ID" != "react-android" && "$ARTIFACT_ID" != "react-native-artifacts" ]]; then
    echo "ARTIFACT_ID must be 'react-android' or 'react-native-artifacts', got: '${ARTIFACT_ID}'"
    exit 1
fi

VERSION="$(jq -r '.dependencies["react-native"]' package.json)"
readonly VERSION

# List all versions of the package
PACKAGE_VERSIONS="$(gh api "/orgs/Expensify/packages/maven/com.expensify.${PACKAGE}.${ARTIFACT_ID}/versions" --paginate --jq '.[].name')"

# Filter only versions matching the base React Native version
PACKAGE_VERSIONS="$(echo "$PACKAGE_VERSIONS" | grep "$VERSION")"

# Grab the highest patch version from there
LATEST_PATCHED_VERSION="$(echo "$PACKAGE_VERSIONS" | sort -V | tail -n1)"

if [[ -n "$LATEST_PATCHED_VERSION" ]]; then
    PATCH_ITERATION=${LATEST_PATCHED_VERSION##*-}
    INCREMENTED_PATCH_ITERATION=$((PATCH_ITERATION + 1))
    echo "${VERSION}-${INCREMENTED_PATCH_ITERATION}"
else
    echo "$VERSION-0"
fi
