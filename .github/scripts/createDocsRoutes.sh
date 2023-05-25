#!/bin/bash
#
# Re-compiles the routes.yml required by the docs and verifies that there is no diff,
# because that would indicate that the PR author forgot to run `npm run createDocsRoutes`
# and commit the updated routes file.

declare -r GREEN='\033[0;32m'
declare -r NC='\033[0m'

printf '\nRebuilding docs/routes.yml...\n'
npm run createDocsRoutes
SCRIPT_EXIT_CODE=$?

if [[ SCRIPT_EXIT_CODE -eq 1 ]]; then
    exit 1
else
    echo -e "${GREEN}The docs routes files is up to date!${NC}"
    exit 0
fi
