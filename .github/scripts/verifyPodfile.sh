#!/bin/bash

START_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR" || exit 1

source scripts/shellUtils.sh

title "Verifying that Podfile.lock is synced with the project"

declare EXIT_CODE=0

PODFILE_SHA=$(openssl sha1 ios/Podfile | awk '{print $2}')
PODFILE_LOCK_SHA=$(awk '/PODFILE CHECKSUM: /{print $3}' ios/Podfile.lock)

echo "Podfile: $PODFILE_SHA"
echo "Podfile.lock: $PODFILE_LOCK_SHA"

if [ "$PODFILE_SHA" == "$PODFILE_LOCK_SHA" ]; then
    success "Podfile checksum verified!"
else
    error "Podfile.lock checksum mismatch. Did you forget to run \`npx pod-install\`?"
    EXIT_CODE=1
fi

info "Comparing Podfile.lock with node packages..."

# Retrieve a list of podspec directories as listed in the Podfile.lock
SPEC_DIRS=$(yq '.["EXTERNAL SOURCES"].[].":path" | select( . == "*node_modules*")' < ios/Podfile.lock)

# Format a list of Pods based on the output of the config command
FORMATTED_PODS=$( \
  jq --raw-output --slurp 'map((.name + " (" + .version + ")")) | .[]' <<< "$( \
    npx react-native config | \
    jq '.dependencies[].platforms.ios.podspecPath | select( . != null )' | \
    xargs -L 1 pod ipc spec --silent
  )"
)

# Check for uncommitted package removals
# If they are listed in Podfile.lock but the directories don't exist they have been removed
while read -r DIR; do
  if [ ! -d "${DIR#../}" ]; then
    error "Directory \`${DIR#../node_modules/}\` not found in node_modules. Did you forget to run \`npx pod-install\` after removing the package?"
    EXIT_CODE=1
  fi
done <<< "$SPEC_DIRS"

# Check for uncommitted package additions/updates
while read -r POD; do
  if ! grep -q "$POD" ./ios/Podfile.lock; then
    error "$POD not found in Podfile.lock. Did you forget to run \`npx pod-install\`?"
    EXIT_CODE=1
  fi
done <<< "$FORMATTED_PODS"

if [[ "$EXIT_CODE" == 0 ]]; then
  success "Podfile.lock is up to date."
fi

# Cleanup
cd "$START_DIR" || exit 1

exit $EXIT_CODE
