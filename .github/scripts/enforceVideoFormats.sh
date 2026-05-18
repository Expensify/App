#!/bin/bash

# Checks for usage of iframe and non-cloudflare URL for videos in documentation.
# Assumes that Jekyll markdown documents compile and render correctly, i.e.
# no malformed HTML tags or liquid tags.
set -eu

source ./scripts/shellUtils.sh
title "Enforce no iframe usage for videos and cloudflare CDN links"
HAS_VIOLATION=false

# Use diff to find all changed markdown files in the docs/ directory compared
# the current HEAD commit on main. This will mirror behavior on the workflow
# when the local copy of origin/main is up-to-date. We exclude the README.md
# files from linting.
CHANGED_FILES="$(git diff origin/main..HEAD --name-only --diff-filter=MAR -- ':docs/*.md' ':(exclude,icase)*README.md')"

# RegEx to match the opening iframe tags.
# Matches iframes like: <iframe src="https://myembeddedvideo.com" allowfullscreen width="10" height="10" allow="autoplay">
# Broken into 2 consecutive non-capturing groups "(?:[...])".
# Non-capturing groups are part of the matching pattern, but not returned in matches.
# First Group: "<iframe[^>]*?"
# -  Checks for the iframe opening tag <iframe, and "[^>]*" non-greedily
#    consumes characters except for ">" (as few characters as possible
#    upto the closing tag).
# Second Group: OR of three attribute tags "(\s*width|\s*height|\s*src)+"
# -  This "+" checks for at least one of the attributes in the group, in any order.
#    This is what we use to check if it's an embed.
# -  Each attribute tag consists of a named capturing group that saves quoted value
#    after the "=":
#    -  [\"\"'](?<width>[^\"\"']+)[\"\"']
#       This matches the opening quotation marks followed by the named capturing
#       group (?<width>[....]) and the [^\"\"'] matches any character that isn't
#       a closing quotation mark. This doesn't allow for empty width attribute.
#       Followed by the closing quotation mark.
# Finally, [^>]*? consumes all remaining characters after the attributes and 
# closes the iframe tag with ">". We consider there to be an iframe in the file
# if all this is satisfied.
REGEX="(?:<iframe[^>]*?)(?:\s*width=[\"\"'](?<width>[^\"\"']+)[\"\"']|\s*height=[\"\"'](?<height>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+[^>]*?>"
while IFS= read -r FILE; do
    while IFS= read -r MATCH; do
        error "$FILE:$MATCH Do not use iframes for video embeds."
        HAS_VIOLATION=true
    done < <(pcregrep -n "$REGEX" "$FILE")
done <<< "$CHANGED_FILES"

# RegEx to match liquid Jekyll tag for included videos, and extracts the src.
# Matches includes like:  {% include video.html src="https://incorrectlyembeddedvideo.com" %}
#
# The regex begins by checking for the opening "{% include video.html" with any
# white spacing that wouldn't break the liquid tag. Followed by some white space.
#
# Next we have one non-capturing group "(?:[...])+" for attributes "thumbnail=..." and "src=....".
# We expect at least one of these elements to appear.
# Each attribute is formatted as: \s*ATTR=[\"\"'](?<ATTR>[^\"\"']+)[\"\"']
# -  This is zero or more whitespace followed by the opening "ATTR=", opening
#    quotes with non-empty string inside, and closing quotes. We capture the
#    value of the attribute using a named capturing group "(?<ATTR>[...])".
#    The attribute is closed then with some closing quotation marks "[\"\"']".
# We close the regex with optional white space and ending %}. We extract 
REGEX="{%\s*include\s+video\.html\s+(?:\s*thumbnail=[\"\"'](?<thumbnail>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+\s*%}"

# RegEx to match a cloudflare CDN URL. Expects leading customer number and trailing content ID.
# We match the "https://" followed by some subdomain "(?:\S+)" of alphanumeric-characters
# usually customer information, then ".cloudflarestream.com/" and the optional trailing
# remaining characters "(?:\S*)" usually content ID.
CDN_REGEX="https:\/\/(?:\S+)\.cloudflarestream\.com\/(?:\S*)"
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
