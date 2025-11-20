#!/bin/bash

if [[ "$CONFIGURATION" == *Debug* ]]; then
  echo "Skipping Sentry source map upload for Debug configuration"
  exit 0
fi

if [ -z "$SENTRY_AUTH_TOKEN" ]; then
  echo "Warning: SENTRY_AUTH_TOKEN not set, skipping Sentry source map upload"
  exit 0
fi

echo "Uploading source maps to Sentry..."

export SENTRY_ORG="${SENTRY_ORG:-expensify}"
export SENTRY_PROJECT="${SENTRY_PROJECT:-app}"

# Get the release version from package.json
PACKAGE_VERSION=$(cat "$PROJECT_DIR/../package.json" | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
PACKAGE_NAME=$(cat "$PROJECT_DIR/../package.json" | grep '"name"' | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')
RELEASE_VERSION="$PACKAGE_NAME@$PACKAGE_VERSION"

echo "Release version: $RELEASE_VERSION"

# Path to the sentry-cli
SENTRY_CLI="$PROJECT_DIR/../node_modules/@sentry/cli/bin/sentry-cli"

if [ ! -f "$SENTRY_CLI" ]; then
  echo "Error: sentry-cli not found at $SENTRY_CLI"
  exit 1
fi

# Upload the bundle and source map
# The source map is generated alongside the bundle during the React Native bundling phase
BUNDLE_PATH="$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/main.jsbundle"
SOURCEMAP_PATH="$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/main.jsbundle.map"

if [ ! -f "$SOURCEMAP_PATH" ]; then
  echo "Warning: Source map not found at $SOURCEMAP_PATH, skipping upload"
  exit 0
fi

echo "Bundle path: $BUNDLE_PATH"
echo "Source map path: $SOURCEMAP_PATH"

# Upload source maps to Sentry
"$SENTRY_CLI" sourcemaps upload \
  --org "$SENTRY_ORG" \
  --project "$SENTRY_PROJECT" \
  --release "$RELEASE_VERSION" \
  --dist "$CONFIGURATION" \
  --strip-prefix "$PROJECT_DIR/.." \
  "$BUNDLE_PATH" \
  "$SOURCEMAP_PATH"

if [ $? -eq 0 ]; then
  echo "Successfully uploaded source maps to Sentry"
else
  echo "Error uploading source maps to Sentry"
  exit 1
fi

