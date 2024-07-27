#!/bin/bash

# This script ensures pod installs respect Podfile.lock as the source of truth.
# Specifically, the podspecs for pods listed under the 'EXTERNAL SOURCES' key in the Podfile.lock are cached in the `ios/Pods/Local Podspecs` directory.
# While caching results in significantly faster installs, if a cached podspec doesn't match the version in Podfile.lock, pod install will fail.
# To prevent this, this script will find and deleted any mismatched cached podspecs before running pod install

# Exit immediately if any command exits with a non-zero status
set -e

# Go to project root
START_DIR="$(pwd)"
ROOT_DIR="$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")"
cd "$ROOT_DIR" || exit 1

# Cleanup and exit
# param - status code
function cleanupAndExit {
  cd "$START_DIR" || exit 1
  exit "$1"
}

source scripts/shellUtils.sh

# Check if bundle is installed
if ! bundle --version > /dev/null 2>&1; then
  error 'bundle is not installed. Please install bundle and try again'
  cleanupAndExit 1
fi

# Check if jq is installed
if ! jq --version > /dev/null 2>&1; then
  error 'jq is not installed. Please install jq and try again'
  cleanupAndExit 1
fi

# Check if yq is installed
if ! yq --version > /dev/null 2>&1; then
  error 'yq is not installed. Please install yq and try again'
  cleanupAndExit 1
fi

if [ -d 'ios/Pods/Local Podspecs' ]; then
  info "Verifying pods from Podfile.lock match local podspecs..."

  # Convert podfile.lock to json since yq is missing some features of jq (namely, if/else)
  PODFILE_LOCK_AS_JSON="$(yq -o=json ios/Podfile.lock)"

  # Retrieve a list of pods and their versions from Podfile.lock
  declare PODS_FROM_LOCKFILE
  if ! read_lines_into_array PODS_FROM_LOCKFILE < <(jq -r '.PODS | map (if (.|type) == "object" then keys[0] else . end) | .[]' < <(echo "$PODFILE_LOCK_AS_JSON")); then
    error "Error: Could not parse pod versions from Podfile.lock"
    cleanupAndExit 1
  fi

  for EXTERNAL_SOURCE_POD in $(jq -cr '."EXTERNAL SOURCES" | keys | .[]' < <(echo "$PODFILE_LOCK_AS_JSON")); do
    LOCAL_PODSPEC_PATH="ios/Pods/Local Podspecs/$EXTERNAL_SOURCE_POD.podspec.json"
    if [ -f "$LOCAL_PODSPEC_PATH" ]; then
      info "🫛 Verifying local pod $EXTERNAL_SOURCE_POD"
      POD_VERSION_FROM_LOCAL_PODSPECS="$(jq -r '.version' < <(cat "$LOCAL_PODSPEC_PATH"))"
      for POD_FROM_LOCKFILE in "${PODS_FROM_LOCKFILE[@]}"; do
        IFS=' ' read -r POD_NAME_FROM_LOCKFILE POD_VERSION_FROM_LOCKFILE <<< "$POD_FROM_LOCKFILE"
        if [[ "$EXTERNAL_SOURCE_POD" == "$POD_NAME_FROM_LOCKFILE" ]]; then
          if [[ "$POD_VERSION_FROM_LOCKFILE" != "($POD_VERSION_FROM_LOCAL_PODSPECS)" ]]; then
            clear_last_line
            info "⚠️  found mismatched pod: $EXTERNAL_SOURCE_POD, removing local podspec $LOCAL_PODSPEC_PATH"
            rm "$LOCAL_PODSPEC_PATH"
            echo -e "\n"
          fi
          break
        fi
      done
      clear_last_line
    fi
  done
fi

cd ios || cleanupAndExit 1
bundle exec pod install

# Go back to where we started
cleanupAndExit 0
