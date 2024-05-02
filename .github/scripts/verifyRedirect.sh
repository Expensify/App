#!/bin/bash

# HelpDot - Verifies that redirects.csv does not have any duplicates
# Duplicate sourceURLs break redirection on cloudflare pages

declare -r REDIRECTS_FILE="docs/redirects.csv"

declare -r RED='\033[0;31m'
declare -r GREEN='\033[0;32m'
declare -r NC='\033[0m'

duplicates=$(awk -F, 'a[$1]++{print $1}' $REDIRECTS_FILE)
if [[ -n "$duplicates" ]]; then
    echo "${RED}duplicate redirects are not allowed: $duplicates ${NC}"
    exit 1
fi

npm run detectRedirectCycle
DETECT_CYCLE_EXIT_CODE=$?
if [[ DETECT_CYCLE_EXIT_CODE -eq 1 ]]; then
    echo -e "${RED}The redirects.csv has a cycle. Please remove the redirect cycle because it will cause an infinite redirect loop ${NC}"
    exit 1
fi

echo -e "${GREEN}The redirects.csv is valid!${NC}"
exit 0
