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

readonly VERSION="$(jq -r '.dependencies["react-native"]' package.json)"

MAVEN_METADATA_URL="https://maven.pkg.github.com/Expensify/App/com/example/${PACKAGE}/react-android/maven-metadata.xml"

VERSIONS_FROM_MAVEN_REPOSITORY=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    "$MAVEN_METADATA_URL" | \
    grep -o "<version>${VERSION}-[0-9]\+</version>" | \
    grep -o "${VERSION}-[0-9]" | \
    sort -t'-' -k2 -n)

LATEST_PATCHED_VERSION=$(echo "$VERSIONS_FROM_MAVEN_REPOSITORY" | tail -n1)

if [ -n "$LATEST_PATCHED_VERSION" ]; then
    PATCH_ITERATION=${LATEST_PATCHED_VERSION##*-}
    INCREMENTED_PATCH_ITERATION=$((PATCH_ITERATION + 1))
    echo "${VERSION}-${INCREMENTED_PATCH_ITERATION}"
else
    echo "$VERSION-0"
fi
