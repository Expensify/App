#!/bin/bash

# HelpDot - Verifies that redirects.csv does not have any duplicates
# Duplicate sourceURLs break redirection on cloudflare pages

duplicates=$(awk -F, 'a[$1]++{print "duplicate sourceURLs are not allowed: " $1}' ../../docs/redirects.csv)

if [[ -z "$duplicates" ]]; then
    exit 0
fi

echo $duplicates
exit 1
