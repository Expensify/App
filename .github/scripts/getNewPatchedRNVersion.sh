#!/bin/bash

if [[ "$IS_HYBRID_BUILD" == "true" ]]; then
    readonly PACKAGE="react-hybrid"
else
    readonly PACKAGE="react-standalone"
fi

VERSION="$(jq -r '.dependencies["react-native"]' package.json)"
readonly VERSION


MAVEN_METADATA_URL=https://example.com/com/expensify/${PACKAGE}/react-android/maven-metadata.xml

# Fetch the XML file using curl
XML_CONTENT=$(curl -s "$MAVEN_METADATA_URL")

# Extract versions from maven-metadata.xml with grep due to the absence of XML parsers on GitHub runners.
PACKAGE_VERSIONS=$(echo "$XML_CONTENT" |  grep -o "${VERSION}-[0-9]\+")

# Grab the highest patch version from there
LATEST_PATCHED_VERSION="$(echo "$PACKAGE_VERSIONS" | sort -V | tail -n1)"

if [[ -n "$LATEST_PATCHED_VERSION" ]]; then
    PATCH_ITERATION=${LATEST_PATCHED_VERSION##*-}
    INCREMENTED_PATCH_ITERATION=$((PATCH_ITERATION + 1))
    echo "${VERSION}-${INCREMENTED_PATCH_ITERATION}"
else
    echo "$VERSION-0"
fi
