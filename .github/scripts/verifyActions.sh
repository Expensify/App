#!/bin/bash
#
# Re-compiles all Github Actions and verifies that there is no diff,
# because that would indicate that the PR author forgot to run `npm run gh-actions-build`
# and commit the re-bundled the javascript sources.

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NC='\033[0m'

# In order for this script to be safely run from anywhere, we cannot use the raw relative path '../scripts'
declare SCRIPTS_DIR
SCRIPTS_DIR="$(dirname "$(dirname "$0")")/scripts"

declare LIB_PATH
LIB_PATH="/root/expensify/bin/diff-so-fancy"

# Clone diff-so-fancy repository
git clone https://github.com/so-fancy/diff-so-fancy.git $LIB_PATH

# Expose diff-so-fancy to path
PATH=$LIB_PATH:$PATH

# Rebuild all the Github Actions
printf '\nRebuilding GitHub Actions...\n'
npm run gh-actions-build

# Check for a diff
printf '\nChecking for a diff...\n'
git diff | diff-so-fancy | less --tabs=4 -RFX
if [[ $(git diff --quiet --exit-code) -eq 0 ]]; then
    echo -e "${GREEN}Github Actions are up to date!${NC}"
    exit 0
else
    echo -e "${RED}Error: Diff found when Github Actions were rebuilt. Did you forget to run \`npm run gh-actions-build\`?${NC}"
    exit 1
fi
