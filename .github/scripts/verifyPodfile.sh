#!/bin/bash

START_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR" || exit 1

source scripts/shellUtils.sh

title "Verifying that the Podfile.lock is synchronized with the project"

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

info "Verifying Podfile.lock is up to date..."

CONFIGSPECS=$( \
  jq --raw-output --slurp 'map((.name + " (" + .version + ")")) | .[]' <<< "$( \
    npx react-native config | \
    jq '.dependencies[].platforms.ios.podspecPath | select( . != null )' | \
    xargs -L 1 pod ipc spec --silent
  )"
)

LOCKSPECS=$(cat ios/Podfile.lock | yq '.["EXTERNAL SOURCES"].[].":path" | select( . == "*node_modules*")')

# Check for uncommitted package removals
while read -r SPEC; do
  if [ ! -d "${SPEC#../}" ]; then
    error "${SPEC#../node_modules/} not found in node_modules.  Did you forget to run \`npx pod-install\` after removing the package?"
    EXIT_CODE=1
  fi
done <<< "$LOCKSPECS"

# Check for uncommitted package additions/updates
while read -r SPEC; do
  if ! grep -q "$SPEC" ./ios/Podfile.lock; then
    error "Podspec $SPEC not found in Podfile.lock. Did you forget to run \`npx pod-install\`?"
    EXIT_CODE=1
  fi
done <<< "$CONFIGSPECS"

if [[ "$EXIT_CODE" == 0 ]]; then
  success "Podfile.lock is synced with project."
fi

# Cleanup
cd "$START_DIR" || exit 1

exit $EXIT_CODE
