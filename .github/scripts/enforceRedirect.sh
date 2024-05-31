#!/bin/bash

# HelpDot - Whenever an article is moved/renamed/deleted we should verify that
# we have added a redirect link for it in redirects.csv. This ensures that we don't have broken links.

declare -r REDIRECTS_FILE="docs/redirects.csv"
declare -r ARTICLES_DIRECTORY="docs/articles"

hasMovedOrDeletedArticle=false
hasModifiedRedirect=false

if git log main.. --name-status --pretty=format: docs/articles | grep -q -E "^(R|D)"
then
    hasMovedOrDeletedArticle=true
fi

if git log main.. --name-status --pretty=format: docs/redirects.csv | grep -E "^(M)"
then
    hasModifiedRedirect=true
fi

echo $hasMovedOrDeletedArticle
echo $hasModifiedRedirect
