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

# Disable Sentry source map upload for development builds
if [[ "$CONFIGURATION" == *"Development"* ]]; then
  export SENTRY_DISABLE_AUTO_UPLOAD=true
  echo "[SENTRY] Development build detected - auto upload disabled"
fi

# Set release name to match Sentry.init() runtime call
SENTRY_RELEASE="new.expensify@$("$NODE_BINARY" -p "require('$PROJECT_ROOT/package.json').version")"
export SENTRY_RELEASE
echo "[SENTRY] Release name set to: $SENTRY_RELEASE"

if [[ -z "$SENTRY_AUTH_TOKEN" ]]; then
  echo "[SENTRY] WARNING: SENTRY_AUTH_TOKEN is not set"
else
  echo "[SENTRY] Auth token is set ✓"
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

"$NODE_BINARY" --print "require('path').dirname(require.resolve('@sentry/react-native/package.json')) + '/scripts/sentry-xcode.sh'"
