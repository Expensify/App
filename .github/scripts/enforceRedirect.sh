#!/bin/bash

# HelpDot - Whenever an article is moved/renamed/deleted we should verify that
# we have added a redirect link for it in redirects.csv. This ensures that we don't have broken links.

declare -r REDIRECTS_FILE="docs/redirects.csv"
declare -r ARTICLES_DIRECTORY="docs/articles"

# shouldAddRedirect=git
hasAddedRedirect=git diff $REDIRECTS_FILE


echo $hasAddedRedirect
