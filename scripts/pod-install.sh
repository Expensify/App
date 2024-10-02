#!/bin/bash

# This script ensures pod installs respect Podfile.lock as the source of truth.
# Specifically, the podspecs for pods listed under the 'EXTERNAL SOURCES' key in the Podfile.lock are cached in the `ios/Pods/Local Podspecs` directory.
# While caching results in significantly faster installs, if a cached podspec doesn't match the version in Podfile.lock, pod install will fail.
# To prevent this, this script will find and delete any mismatched cached podspecs before running pod install

# Exit immediately if any command exits with a non-zero status
set -e

# Go to NewDot project root
START_DIR="$(pwd)"
ROOT_DIR="$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")"
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" && "$1" != "--new-dot" ]]; then
    cd ../ios
    if [ "$1" == "--clean" ]; then
    bundle exec pod deintegrate
    fi
    # Navigate to the OldDot repository, and run pod install
    bundle exec pod install
    exit 0
fi

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

CACHED_PODSPEC_DIR='ios/Pods/Local Podspecs'
if [ -d "$CACHED_PODSPEC_DIR" ]; then
  info "Verifying pods from Podfile.lock match local podspecs..."

  # Convert podfile.lock to json since yq is missing some features of jq (namely, if/else)
  PODFILE_LOCK_AS_JSON="$(yq -o=json ios/Podfile.lock)"

  # Retrieve a list of pods and their versions from Podfile.lock
  declare PODS_FROM_LOCKFILE
  if ! read_lines_into_array PODS_FROM_LOCKFILE < <(jq -r '.PODS | map (if (.|type) == "object" then keys[0] else . end) | .[]' < <(echo "$PODFILE_LOCK_AS_JSON")); then
    error "Error: Could not parse pod versions from Podfile.lock"
    cleanupAndExit 1
  fi

  for CACHED_PODSPEC_PATH in "$CACHED_PODSPEC_DIR"/*; do
    if [ -f "$CACHED_PODSPEC_PATH" ]; then
      # The next two lines use bash parameter expansion to get just the pod name from the path
      # i.e: `ios/Pods/Local Podspecs/hermes-engine.podspec.json` to just `hermes-engine`
      # It extracts the part of the string between the last `/` and the first `.`
      CACHED_POD_NAME="${CACHED_PODSPEC_PATH##*/}"
      CACHED_POD_NAME="${CACHED_POD_NAME%%.*}"

      info "🫛 Verifying local pod $CACHED_POD_NAME"
      CACHED_POD_VERSION="$(jq -r '.version' < <(cat "$CACHED_PODSPEC_PATH"))"
      for POD_FROM_LOCKFILE in "${PODS_FROM_LOCKFILE[@]}"; do
        # Extract the pod name and version that was parsed from the lockfile. POD_FROM_LOCKFILE looks like `PodName (version)`
        IFS=' ' read -r POD_NAME_FROM_LOCKFILE POD_VERSION_FROM_LOCKFILE <<< "$POD_FROM_LOCKFILE"
        if [[ "$CACHED_POD_NAME" == "$POD_NAME_FROM_LOCKFILE" ]]; then
          if [[ "$POD_VERSION_FROM_LOCKFILE" != "($CACHED_POD_VERSION)" ]]; then
            clear_last_line
            info "⚠️  found mismatched pod: $CACHED_POD_NAME, removing local podspec $CACHED_PODSPEC_PATH"
            rm "$CACHED_PODSPEC_PATH"
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
