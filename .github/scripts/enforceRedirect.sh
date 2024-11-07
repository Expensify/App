#!/bin/bash

# HelpDot - Whenever an article is moved/renamed/deleted we should verify that
# we have added a redirect link for it in redirects.csv. This ensures that we don't have broken links.

declare -r RED='\033[0;31m'
declare -r GREEN='\033[0;32m'
declare -r NC='\033[0m'

declare -r ARTICLES_DIRECTORY="docs/articles"
declare -r REDIRECTS_FILE="docs/redirects.csv"

hasRenamedOrDeletedArticle=false
hasModifiedRedirect=false

if git diff origin/main..HEAD --name-status --pretty=format: $ARTICLES_DIRECTORY | grep -q -E "^(R|D)"
then
    echo "Articles have been renamed/moved/deleted"
    hasRenamedOrDeletedArticle=true
fi

if git diff origin/main..HEAD --name-status --pretty=format: $REDIRECTS_FILE | grep -q -E "^(M)"
then
    echo "Redirects.csv has been modified"
    hasModifiedRedirect=true
fi

if [[ $hasRenamedOrDeletedArticle == true  && $hasModifiedRedirect == false ]]
then
    echo -e "${RED}Articles have been renamed or deleted. Please add a redirect link for the old article links in redirects.csv${NC}"
    exit 1
fi

echo -e "${GREEN}Articles aren't moved or deleted, or a redirect has been added. Please verify that a redirect has been added for all the files moved or deleted${NC}"
exit 0
