#!/bin/bash

# This script requires passing the branch to compare against for removals.
# ie. `./verifyPodfile.sh main`

START_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")")
cd "$ROOT_DIR" || exit 1
source scripts/shellUtils.sh

function resetAndExit() {
  cd "$START_DIR" || exit 1
  exit "$1"
}

podfileSha=$(openssl sha1 ios/Podfile | awk '{print $2}')
podfileLockSha=$(awk '/PODFILE CHECKSUM: /{print $3}' ios/Podfile.lock)

echo "Podfile: $podfileSha"
echo "Podfile.lock: $podfileLockSha"

if [ "$podfileSha" == "$podfileLockSha" ]; then
    success "Podfile checksum verified!"
else
    error "Podfile.lock checksum mismatch. Did you forget to run \`npx pod-install\`?"
    resetAndExit 1
fi

# Make sure package.json and package-lock.json are committed to avoid testing issues
if [ -n "$(git diff --name-only HEAD -- package.json package-lock.json)" ]; then
  error "Uncommitted changes to package.json or package-lock.json.  Commit these before continuing!"
  resetAndExit 1
fi

# Make sure valid branch ref was passed for removal check
if ! git rev-parse --quiet --verify "$1"; then
  error 'Error: Must provide valid branch name as argument for verifyPodfile script.'
  resetAndExit 1
fi

# If npm packages were not modified in the feature branch we can skip the remaining checks
if [ -z "$(git diff --name-only .."$1" package-lock.json package.json)" ]; then
  success "No changes to npm packages were detected."
  resetAndExit 0;
fi

info "Verifying that pods are synced..."

# Extracts an array of podspec paths from the config command
_grab_specs() {
  npx react-native config | jq '[.dependencies[].platforms.ios.podspecPath | select( . != null )]'
}

# Maps an array of podspec paths to a raw list of formatted `Pod (version)`s
_formatted_pod_list() {
    jq --raw-output --slurp 'map((.name + " (" + .version + ")")) | .[]' <<< "$( \
      jq -n '$specs | .[]' --argjson specs "$1" | \
      xargs -L 1 pod ipc spec --silent
    )"
}

# Store an array of the feature branch's podspecs
feature_branch_specs="$(_grab_specs)"

echo -e "Feature branch specs:\n$feature_branch_specs"

# Grab the podspecs from the main branch by checking out the diffed npm packages
git checkout --quiet "$1" -- {package,package-lock}.json
npm i --loglevel silent
main_branch_specs="$(_grab_specs)"

echo -e "Main branch specs:\n$main_branch_specs"

# Perform an array subtraction to determine which pods were removed (main_branch - feature_branch)
removed_specs=$(jq -n --jsonargs '$ARGS.positional | first - last | .' -- "$main_branch_specs" "$feature_branch_specs")

# Store the formatted list here as we won't have the chance after switching back to feature branch
formatted_removals="$(_formatted_pod_list "$removed_specs")"

# Verbose output
[ -n "$formatted_removals" ] && \
echo -e "Removals:\n$formatted_removals" || \
echo "No package removals"

# Revert back to feature branch npm state
git reset --quiet HEAD {package,package-lock}.json
git checkout --quiet -- {package,package-lock}.json
npm i --loglevel silent

# Initialize failed variable as it may be already set by the environment
failed=0

info "Comparing pods.  This may take a moment."

# Validate additions and updates to Podfile.lock
while read -r SPEC; do
  if ! grep -q "$SPEC" ./ios/Podfile.lock; then
    error "Podspec $SPEC not found in Podfile.lock. Did you forget to run \`npx pod-install\`?"
    failed=1
  fi
done <<< "$(_formatted_pod_list "$feature_branch_specs")"

# Validate deletions from Podfile.lock
while read -r SPEC; do
  if [ -n "$SPEC" ] && grep -q "$SPEC" ./ios/Podfile.lock; then
    error "Podspec $SPEC was found in Podfile.lock but not in node modules. \
    Did you forget to run \`npx pod-install\` after removing the package?" | xargs
    failed=1
  fi
done <<< "$formatted_removals"

[ "$failed" -eq 1 ] && resetAndExit 1

success "Podfile.lock is synced with npm packages."
resetAndExit 0
