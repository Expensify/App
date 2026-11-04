#!/bin/bash

# Prints the Hermes version our prebuilt artifacts are compiled against (e.g. `250829098.0.14`), read from
# `sdks/hermes-engine/version.properties` the way upstream's own prebuild workflow does (prebuild-ios-core.yml in
# facebook/react-native). The publish workflows record it in the POM, and the artifacts resolver refuses an artifact
# whose Hermes differs from the one the app links, so an artifact built against the wrong ABI is never used silently.

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

sed -n 's/^HERMES_V1_VERSION_NAME=//p' "$HERMES_VERSION_FILE"
