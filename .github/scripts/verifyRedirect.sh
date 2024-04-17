#!/bin/bash

# HelpDot - Verifies that redirects.csv does not have any duplicates
# Duplicate sourceURLs break redirection on cloudflare pages

declare -r REDIRECTS_FILE="docs/redirects.csv"

duplicates=$(awk -F, 'a[$1]++{print "duplicate redirects are not allowed: " $1}' $REDIRECTS_FILE)

if [[ -z "$duplicates" ]]; then
    exit 0
fi

echo $duplicates
exit 1
