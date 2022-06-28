#!/bin/bash
set -e
# Source map generating script for android and ios js bundles

PLATFORM=$1

if [[ ! $PLATFORM =~ ^(ios|android)$ ]]; then
  error "Unsupported platform '$PLATFORM', possible options are: 'android' or 'ios'"
  exit 1
fi

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
LOCAL_PACKAGES=$(npm bin)
NODE_MODULES="$SCRIPTS_DIR/../node_modules"
source "$SCRIPTS_DIR/shellUtils.sh";

title "Generating $PLATFORM Source Map File"

info ""
info "1. Generating packager map"
info ""

"$LOCAL_PACKAGES/react-native" bundle \
  --platform $PLATFORM \
  --dev false \
  --entry-file index.js \
  --bundle-output index.$PLATFORM.bundle \
  --sourcemap-output index.$PLATFORM.bundle.packager.map \
  --reset-cache \
  --minify false

OS_BIN=""

case "$OSTYPE" in
  darwin*)  OS_BIN=osx-bin ;;
  linux*)   OS_BIN=linux64-bin ;;
  msys*)    OS_BIN=win64-bin ;;
  cygwin*)  OS_BIN=win64-bin ;;
  *)        error "unknown: $OSTYPE" ;;
esac

if [ -z "$OS_BIN" ]; then
  error "Failed to match hermes OS-BIN"
  exit 1;
fi

info ""
info "2. Generating hermes map"
info ""
info "Using hermes OS-BIN: '$OS_BIN'"
info ""

# In react native 0.69 this path needs to change to NODE_MODULES/react-native/sdks/hermesc/$OS_BIN/hermesc
"$NODE_MODULES/hermes-engine/$OS_BIN/hermesc" -O -emit-binary -output-source-map -out=index.$PLATFORM.bundle.hbc index.$PLATFORM.bundle

info ""
info "3. Merging source maps"
info ""

node "$NODE_MODULES/react-native/scripts/compose-source-maps.js" \
  index.$PLATFORM.bundle.packager.map \
  index.$PLATFORM.bundle.hbc.map \
  -o index.$PLATFORM.bundle.map

success ""
success "Result ready: 'index.$PLATFORM.bundle.map'"
success ""
