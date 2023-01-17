#!/bin/bash
#
# Re-compiles all Github Actions and verifies that there is no diff,
# because that would indicate that the PR author forgot to run `npm run gh-actions-build`
# and commit the re-bundled the javascript sources.

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NC='\033[0m'

declare LIB_PATH
LIB_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../../ && pwd)/node_modules/diff-so-fancy"

# Rebuild all the Github Actions
printf '\nRebuilding GitHub Actions...\n'
npm run gh-actions-build

DIFF_OUTPUT=$(git diff --exit-code)
EXIT_CODE=$?

if [[ EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}Github Actions are up to date!${NC}"
    exit 0
else
    echo -e "${RED}Error: Diff found when Github Actions were rebuilt. Did you forget to run \`npm run gh-actions-build\` after a clean install (\`rm -rf node_modules && npm i\`)? Do you need to merge main?${NC}"
    echo "$DIFF_OUTPUT" | "$LIB_PATH/diff-so-fancy" | less --tabs=4 -RFX
    exit 1
fi
