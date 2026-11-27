#!/bin/bash

# Prints the Hermes version our prebuilt artifacts are compiled against (e.g. `260318099.0.4`), read from
# `sdks/hermes-engine/version.properties` the way upstream's own prebuild workflow does (prebuild-ios-core.yml in
# facebook/react-native). It is the version the app links: hermes-engine.podspec and the Gradle plugin read the same key.
# The publish workflows record it in the POM, and the artifacts resolver reads it through this script too and refuses an
# artifact whose Hermes differs, so an artifact built against the wrong ABI is never used silently.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/../shellUtils.sh"

NEW_DOT_ROOT="${1:-$SCRIPT_DIR/../..}"
readonly NEW_DOT_ROOT
readonly HERMES_VERSION_FILE="$NEW_DOT_ROOT/node_modules/react-native/sdks/hermes-engine/version.properties"

if [[ ! -f "$HERMES_VERSION_FILE" ]]; then
    error "Hermes version file not found: $HERMES_VERSION_FILE"
    exit 1
fi

HERMES_VERSION=$(sed -n 's/^HERMES_VERSION_NAME=//p' "$HERMES_VERSION_FILE" | tr -d '[:space:]')
readonly HERMES_VERSION

# An empty version would make the prebuild download a tarball URL without a version and fail with a 404.
if [[ -z "$HERMES_VERSION" ]]; then
    error "HERMES_VERSION_NAME not found in $HERMES_VERSION_FILE"
    exit 1
fi

echo "$HERMES_VERSION"
