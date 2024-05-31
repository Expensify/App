#!/bin/bash

# HelpDot - Whenever an article is moved/renamed/deleted we should verify that
# we have added a redirect link for it in redirects.csv. This ensures that we don't have broken links.

declare -r REDIRECTS_FILE="docs/redirects.csv"
declare -r ARTICLES_DIRECTORY="docs/articles"

hasMovedOrDeletedArticle=$(git log main.. --name-status --pretty=format: docs/articles | grep -E "^(R|D)")
hasModifiedRedirect=$(git log main.. --name-status --pretty=format: docs/redirects.csv | grep "^M")

echo $hasMovedOrDeletedArticle

echo $hasModifiedRedirect
