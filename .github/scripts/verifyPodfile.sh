#!/bin/bash

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

# Extract versions from Gemfile
POD_VERSION_REQUIREMENTS=$(grep 'cocoapods' Gemfile | grep -o "'.*'" | tr -d "'" | tr -d ',' | awk '{print $2, $3}')
POD_VERSION_REQUIREMENTS_2=$(grep 'cocoapods' Gemfile | grep -o "'.*'" | tr -d "'" | tr -d ',' | awk '{print $4, $5}')
info "Pod version requirements from Gemfile: $POD_VERSION_REQUIREMENTS, $POD_VERSION_REQUIREMENTS_2"

# Extract version from Podfile.lock
POD_VERSION_FROM_PODFILE_LOCK=$(grep 'COCOAPODS' ios/Podfile.lock | awk '{print $2}')
info "Pod version from Podfile.lock: $POD_VERSION_FROM_PODFILE_LOCK"

# Use Ruby to compare versions
IS_VERSION_OK_1=$(ruby -r rubygems -e "puts (Gem::Requirement.new('$POD_VERSION_REQUIREMENTS').satisfied_by?(Gem::Version.new('$POD_VERSION_FROM_PODFILE_LOCK')) ? 1 : 0)")
IS_VERSION_OK_2=$(ruby -r rubygems -e "puts (Gem::Requirement.new('$POD_VERSION_REQUIREMENTS_2').satisfied_by?(Gem::Version.new('$POD_VERSION_FROM_PODFILE_LOCK')) ? 1 : 0)")

if [ "$IS_VERSION_OK_1" -eq "1" ] && [ "$IS_VERSION_OK_2" -eq "1" ]; then
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

if ! read_lines_into_array PODSPEC_PATHS < <(npx react-native config | jq --raw-output '.dependencies[].platforms.ios.podspecPath | select ( . != null)'); then
  error "Error: could not parse podspec paths from react-native config command"
  cleanupAndExit 1
fi

# Format a list of Pods based on the output of the config command
if ! FORMATTED_PODS=$( \
  jq --raw-output --slurp 'map((.name + " (" + .version + ")")) | .[]' <<< "$(./.github/scripts/printPodspec.rb "${PODSPEC_PATHS[@]}")" \
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
