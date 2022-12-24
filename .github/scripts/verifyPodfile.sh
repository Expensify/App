#!/bin/bash

# First argument is the branch to compare against for deletions
# Second argument is optionally `-v` which will output the branch podspecs and the subtractions if they exist

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NC='\033[0m'

podfileSha=$(openssl sha1 ios/Podfile | awk '{print $2}')
podfileLockSha=$(awk '/PODFILE CHECKSUM: /{print $3}' ios/Podfile.lock)

echo "Podfile: $podfileSha"
echo "Podfile.lock: $podfileLockSha"

if [ "$podfileSha" == "$podfileLockSha" ]; then
    echo -e "${GREEN}Podfile checksum verified!${NC}"
else
    echo -e "${RED}Error: Podfile.lock checksum mismatch. Did you forget to run \`npx pod-install\`?${NC}"
    exit 1
fi

# Maps a list of podspec paths to formatted `Pod (version)` format
_formatted_pods() {
    jq --raw-output --slurp 'map((.name + " (" + .version + ")")) | .[]' <<< "$( \
      echo "$1" | \
      xargs -L 1 pod ipc spec --silent
    )"
}

# Checks whether a formatted version of the Pod (version) exists in the Podfile.lock
_in_podlock() {
  grep -q "$1" ./ios/Podfile.lock
}

# Extracts a list of podspec paths from react-native command
_get_specs() {
  npx react-native config | jq '.dependencies[].platforms.ios.podspecPath | select( . != null )'
}

# Store the feature branch's podspecs in a variable so we can compare against main branch (for determining removals)
feature_branch_specs="$(_get_specs)"

## Verbosity
[ "$2" == "-v" ] && echo "Feature branch specs:" && echo "$feature_branch_specs"

# Grab the podspecs from the main branch by checking out npm package and lockfile
git checkout --quiet "$1" -- {package,package-lock}.json
npm i --silent
main_branch_specs="$(_get_specs)"

# Verbosity
[ "$2" == "-v" ] && echo "Main branch specs:" && echo "$main_branch_specs"

# Perform an array subtraction to determine which pods were removed
# Store the formatted version here as we won't have the chance after switching back to feature branch
formatted_subtractions="$(_formatted_pods "$(jq -n --args '$ARGS.positional | map(. / "\n" | map(fromjson)) | first - last | .[]' -- \
"$main_branch_specs" "$feature_branch_specs")")"

# Verbosity
[ "$2" == "-v" ] && echo "Subtractions:" && echo "$formatted_subtractions"

# Switch back to feature branch
git reset --quiet HEAD {package,package-lock}.json
git checkout --quiet -- {package,package-lock}.json
npm i --silent

# Validate additions and updates to Podfile.lock (check whether feature branch specs _are not_ in Podfile.lock)
while read -r SPEC; do
  if ! _in_podlock "$SPEC"; then
    echo -e "${RED}ERROR: Podspec $SPEC not found in Podfile.lock. Did you forget to run \`pod install\`?"
    failed=1
  fi
done <<< "$(_formatted_pods "$feature_branch_specs")"

# Validate deletions (check whether the subtractions _are_ in Podfile.lock)
while read -r SPEC; do
  if [ ! -z "$SPEC" ] && _in_podlock "$SPEC"; then
    echo -e "${RED} ERROR: Podspec $SPEC was found in Podfile.lock and not part of project. Did you forget to run \`pod install\` after removing the package?"
    failed=1
  fi
done <<< "$formatted_subtractions"

[ "$failed" != "" ] && exit 1

echo -e "${GREEN}Podfile.lock is synced with podspecs."
exit 0
