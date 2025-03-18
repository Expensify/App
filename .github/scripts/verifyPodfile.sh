#!/bin/bash

set -e

START_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR" || exit 1

source scripts/shellUtils.sh

title "Verifying that Podfile.lock is synced with the project"

# Cleanup and exit
# param - status code
function cleanupAndExit {
  cd "$START_DIR" || exit 1
  exit "$1"
}

# Check Provisioning Style. If automatic signing is enabled, iOS builds will fail, so ensure we always have the proper profile specified
info "Verifying that automatic signing is not enabled"
if grep -q 'PROVISIONING_PROFILE_SPECIFIER = "(NewApp) AppStore"' ios/NewExpensify.xcodeproj/project.pbxproj; then
  success "Automatic signing not enabled"
else
  error "Error: Automatic provisioning style is not allowed!"
  cleanupAndExit 1
fi

PODFILE_SHA=$(openssl sha1 ios/Podfile | awk '{print $2}')
PODFILE_LOCK_SHA=$(awk '/PODFILE CHECKSUM: /{print $3}' ios/Podfile.lock)

echo "Podfile: $PODFILE_SHA"
echo "Podfile.lock: $PODFILE_LOCK_SHA"

if [[ "$PODFILE_SHA" == "$PODFILE_LOCK_SHA" ]]; then
  success "Podfile checksum verified!"
else
  error "Podfile.lock checksum mismatch. Did you forget to run \`npx pod-install\`?"
  cleanupAndExit 1
fi

info "Ensuring correct version of cocoapods is used..."

POD_VERSION_REGEX='([[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+)?';
POD_VERSION_FROM_GEMFILE="$(sed -nr "s/gem \"cocoapods\", \"= $POD_VERSION_REGEX\"/\1/p" Gemfile)"
info "Pod version from Gemfile: $POD_VERSION_FROM_GEMFILE"

POD_VERSION_FROM_PODFILE_LOCK="$(sed -nr "s/COCOAPODS: $POD_VERSION_REGEX/\1/p" ios/Podfile.lock)"
info "Pod version from Podfile.lock: $POD_VERSION_FROM_PODFILE_LOCK"

if [[ "$POD_VERSION_FROM_GEMFILE" == "$POD_VERSION_FROM_PODFILE_LOCK" ]]; then
  success "Cocoapods version from Podfile.lock matches cocoapods version from Gemfile"
else
  error "Cocoapods version from Podfile.lock does not match cocoapods version from Gemfile. Please use \`npm run pod-install\` or \`bundle exec pod install\` instead of \`pod install\` to install pods."
  cleanupAndExit 1
fi

info "Comparing Podfile.lock with node packages..."

# Retrieve a list of podspec directories as listed in the Podfile.lock
if ! SPEC_DIRS=$(yq '.["EXTERNAL SOURCES"].[].":path" | select( . == "*node_modules*")' < ios/Podfile.lock); then
  error "Error: Could not parse podspec directories from Podfile.lock"
  cleanupAndExit 1
fi

# Retrieve a list of podspec paths from react-native config
if ! read_lines_into_array PODSPEC_PATHS < <(npx react-native config | jq --raw-output '.dependencies[].platforms.ios.podspecPath | select ( . != null)'); then
  error "Error: could not parse podspec paths from react-native config command"
  cleanupAndExit 1
fi

PODSPECS=$(./.github/scripts/printPodspec.rb "${PODSPEC_PATHS[@]}")

# Format a list of Pods based on the output of the config command
if ! FORMATTED_PODS=$( \
  jq --raw-output --slurp 'map((.name + " (" + .version + ")")) | .[]' <<< "$(./.github/scripts/removeInvalidJson.rb "${PODSPECS}")" \
); then
  error "Error: could not parse podspecs at paths parsed from react-native config"
  cleanupAndExit 1
fi

# Check for uncommitted package removals
# If they are listed in Podfile.lock but the directories don't exist they have been removed
while read -r DIR; do
  if [[ ! -d "${DIR#../}" ]]; then
    error "Directory \`${DIR#../node_modules/}\` not found in node_modules. Did you forget to run \`npx pod-install\` after removing the package?"
    cleanupAndExit 1
  fi
done <<< "$SPEC_DIRS"

# Check for uncommitted package additions/updates
while read -r POD; do
  if ! grep -q "$POD" ./ios/Podfile.lock; then
    error "$POD not found in Podfile.lock. Did you forget to run \`npx pod-install\`?"
    cleanupAndExit 1
  fi
done <<< "$FORMATTED_PODS"

success "Podfile.lock is up to date."
cleanupAndExit 0
