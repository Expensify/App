#!/bin/bash

VERSION="$1"

if [ -z "$VERSION" ]; then
    echo "Missing version argument"
    exit 1
fi

if [[ "$IS_HYBRID_BUILD" == "true" ]]; then
    PACKAGE="react-hybrid"
else
    PACKAGE="react-standalone"
fi

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
