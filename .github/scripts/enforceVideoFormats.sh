#!/bin/bash

# Checks for usage of iframe and non-cloudflare URL for videos in documentation.
set -eu

source ./scripts/shellUtils.sh
title 'Enforce no iframe usage for videos and cloudflare CDN links'
HAS_VIOLATION=false
CHANGED_FILES=$(git diff origin/main..HEAD --name-only --diff-filter=MAR -- ':docs/*.md' ':(exclude,icase)*README.md')
# Use diff to find all changed markdown files in the docs/ directory, not README.md
REGEX="(?:<iframe[^>]*?)(?:\s*width=[\"\"'](?<width>[^\"\"']+)[\"\"']|\s*height=[\"\"'](?<height>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+[^>]*?>"
# RegEx to match iframe tags. Broken into 2 non-capturing groups.
# 1. Checks for the iframe opening tag <iframe, non-greedily consume characters
#    upto the next non-capturing group (not including ">").
# 2. Check for attributes "width", "height" or "src" in any order and store in
#    named groups accordingly. At least one must match for the RegEx to match.
#    Consume lazily upto not including closing ">".
# Finally end the iframe tag with ">".

while IFS= read -r FILE; do
    while IFS= read -r MATCH; do
        error "$FILE:$MATCH Do not use iframes for video embeds."
        HAS_VIOLATION=true
    done < <(pcregrep -n "$REGEX" "$FILE")
done <<< "$CHANGED_FILES"

REGEX="{%\s*include\s+video\.html\s+(?:\s*thumbnail=[\"\"'](?<thumbnail>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+\s*%}"
# RegEx to match liquid Jekyll tag for included videos. Broken into two non-capturing groups
# 1. Check for the opening {% include video.html, followed by white space upto
#    attributes
# 2. Check for attributes in any order for thumbnail and src as named capturing
#    groups. We use src to check the URL to compare to the CDN URL. At least
#    one of these attributes must exist.
# We close the regex with optional white space and ending %}.

CDN_REGEX="https:\/\/(?:\S+)\.cloudflarestream.com\/(?:\S*)"
# RegEx to match a cloudflare CDN URL. Leading customer number and trailing content ID.
while IFS= read -r FILE; do
    while IFS= read -r MATCH; do
        if ! echo "$MATCH" | pcregrep -q "$CDN_REGEX"; then
            error "$FILE:$MATCH Video URL must be from Cloudflare CDN."
            HAS_VIOLATION=true
        fi
    done < <(pcregrep -n "$REGEX" "$FILE")
done <<< "$CHANGED_FILES"

if [[ $HAS_VIOLATION == true ]]; then
    error "Documentation has video violations"
    exit 1
fi

success "No violations."
