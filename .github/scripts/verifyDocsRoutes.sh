#!/bin/bash
#
# Re-compiles the routes.yml required by the docs and verifies that there is no diff,
# because that would indicate that the PR author forgot to run `npm run createDocsRoutes`
# and commit the updated routes file.

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NC='\033[0m'

declare LIB_PATH
LIB_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../../ && pwd)/node_modules/diff-so-fancy"

printf '\nRebuilding docs/routes.yml...\n'
npm run createDocsRoutes
SCRIPT_EXIT_CODE=$?

DIFF_OUTPUT=$(git diff --exit-code)
DIFF_EXIT_CODE=$?

if [[ SCRIPT_EXIT_CODE -eq 1 ]]; then
    exit 1
elif [[ DIFF_EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}The docs routes files is up to date!${NC}"
    exit 0
else
    echo -e "${RED}Error: Diff found when the docs/routes.yml were rebuilt. Did you forget to run \`npm run createDocsRoutes\` after adding new articles to the docs?${NC}"
    echo "$DIFF_OUTPUT" | "$LIB_PATH/diff-so-fancy" | less --tabs=4 -RFX
    exit 1
fi
