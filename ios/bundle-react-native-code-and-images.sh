#!/bin/bash

if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# The project root by default is one level up from the ios directory
export PROJECT_ROOT="$PROJECT_DIR/.."

if [[ "$CONFIGURATION" = *Debug* ]]; then
  export SKIP_BUNDLING=1
fi
if [[ -z "$ENTRY_FILE" ]]; then
  # Set the entry JS file using the bundler's entry resolution.
  ENTRY_FILE="$("$NODE_BINARY" -e "require('expo/scripts/resolveAppEntry')" "$PROJECT_ROOT" ios relative | tail -n 1)"
  export ENTRY_FILE
fi

if [[ -z "$CLI_PATH" ]]; then
  export CONFIG_CMD="dummy-workaround-value"
  CLI_PATH="$("$NODE_BINARY" --print "require('path').dirname(require.resolve('rock/package.json')) + '/dist/src/bin.js'")"
  export CLI_PATH
fi
if [[ -z "$BUNDLE_COMMAND" ]]; then
  # CLI command for bundling
  export BUNDLE_COMMAND="bundle"
fi

"$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"
