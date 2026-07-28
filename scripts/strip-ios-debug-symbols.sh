#!/bin/bash
#
# Strips debug symbols from the app binary and embedded frameworks for non-Debug builds.
# This reduces the IPA size by ~22MB without affecting crash symbolication, because Xcode
# generates dSYMs from the unstripped binary before this phase runs.
#
# Expected Xcode environment variables:
#   CONFIGURATION, BUILT_PRODUCTS_DIR, EXECUTABLE_FOLDER_PATH, EXECUTABLE_NAME,
#   EXPANDED_CODE_SIGN_IDENTITY

set -e

case "$CONFIGURATION" in
  Debug*)
    echo "Skipping symbol stripping for $CONFIGURATION build."
    exit 0
    ;;
esac

APP_DIR_PATH="${BUILT_PRODUCTS_DIR}/${EXECUTABLE_FOLDER_PATH}"

echo "Stripping main binary: ${APP_DIR_PATH}/${EXECUTABLE_NAME}"
strip -rSTx "${APP_DIR_PATH}/${EXECUTABLE_NAME}"

APP_FRAMEWORKS_DIR="${APP_DIR_PATH}/Frameworks"
if [ -d "$APP_FRAMEWORKS_DIR" ]; then
  find "$APP_FRAMEWORKS_DIR" -name "*.framework" -maxdepth 1 -type d | while read -r framework_dir; do
    framework_name=$(basename "$framework_dir" .framework)
    framework_binary="$framework_dir/$framework_name"
    if [ ! -f "$framework_binary" ]; then
      continue
    fi
    if codesign -v -R="anchor apple" "$framework_binary" &> /dev/null; then
      echo "Skipping Apple-signed: $framework_name"
      continue
    fi
    echo "Stripping framework: $framework_name"
    strip -rSTx "$framework_binary"
    codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY:--}" --preserve-metadata=identifier,entitlements "$framework_dir"
  done
else
  echo "No Frameworks directory found at $APP_FRAMEWORKS_DIR"
fi

echo "Symbol stripping complete."
