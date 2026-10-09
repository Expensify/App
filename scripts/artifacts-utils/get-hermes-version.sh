#!/bin/bash

# Prints the Hermes version our prebuilt artifacts are compiled against (e.g. `250829098.0.14`), read from
# `sdks/hermes-engine/version.properties` exactly as upstream's own prebuild workflow does (see
# `.github/workflows/prebuild-ios-core.yml` in facebook/react-native). It is the version `ios-prebuild.js` receives
# through HERMES_VERSION, and the one the consuming app links through hermes-engine.podspec and the Gradle plugin.
#
# The published POM records this value so that the artifacts resolver can compare it with the Hermes the consuming
# app links. The artifacts do not bundle a Hermes engine, but their React code is compiled against the ABI of one, so
# an artifact built against a different Hermes is unusable. We cannot predict how upcoming upstream versions will
# pick the Hermes version (which file, whether V1 stays opt-in), so this tag is the safeguard against silently
# consuming artifacts built against the wrong ABI: on a mismatch the consumer falls back to a source build and
# names both versions in its log, instead of failing at link time or at runtime.

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
