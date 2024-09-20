#!/bin/bash

# HelpDot - Verifies that redirects.csv does not have any errors that would prevent
# the bulk redirects in Cloudflare from working. This includes:
# Duplicate sourceURLs
# Source URLs containing anchors or URL params
# URLs pointing to themselves
#
# We also prevent adding source or destination URLs outside of an allowed list
# of domains. That's because these redirects run on our zone as a whole, so you
# could add a redirect for sites outside of help/community and Cloudflare would allow it
# and it would work.

source scripts/shellUtils.sh

declare -r REDIRECTS_FILE="docs/redirects.csv"
declare -a ITEMS_TO_ADD

duplicates=$(awk -F, 'a[$1]++{print $1}' $REDIRECTS_FILE)
if [[ -n "$duplicates" ]]; then
    echo "${RED}duplicate redirects are not allowed: $duplicates ${RESET}"
    exit 1
fi

npm run detectRedirectCycle
DETECT_CYCLE_EXIT_CODE=$?
if [[ DETECT_CYCLE_EXIT_CODE -eq 1 ]]; then
    echo -e "${RED}The redirects.csv has a cycle. Please remove the redirect cycle because it will cause an infinite redirect loop ${RESET}"
    exit 1
fi

while read -r line; do
    # Split each line of the file into a source and destination so we can sanity check
    # and compare against the current list.
    read -r -a LINE_PARTS < <(echo "$line" | tr ',' ' ')
    SOURCE_URL=${LINE_PARTS[0]}
    DEST_URL=${LINE_PARTS[1]}

    # Make sure that the source and destination are not identical
    if [[ "$SOURCE_URL" == "$DEST_URL" ]]; then
        error "Source and destination URLs are identical: $SOURCE_URL"
        exit 1
    fi

    # Make sure the format of the line is as expected.
    if [[ "${#LINE_PARTS[@]}" -gt 2 ]]; then
        error "Found a line with more than one comma: $line"
        exit 1
    fi

    # Basic sanity checking to make sure that the source and destination are in expected
    # subdomains.
    if ! [[ $SOURCE_URL =~ ^https://(community|help)\.expensify\.com ]] || [[ $SOURCE_URL =~ (\#|\?) ]]; then
    error "Found source URL that is not a communityDot or helpDot URL, or contains a '#' or '?': $SOURCE_URL"
    exit 1
fi

    if ! [[ $DEST_URL =~ ^https://(help|use|integrations)\.expensify\.com|^https://www\.expensify\.org ]]; then
        error "Found destination URL that is not a supported URL: $DEST_URL"
        exit 1
    fi

    info "Source: $SOURCE_URL and destination: $DEST_URL appear to be formatted correctly."

    ITEMS_TO_ADD+=("$line")

# This line skips the first line in the csv because the first line is a header row.
done <<< "$(tail +2 $REDIRECTS_FILE)"

# Sanity check that we should actually be running this and we aren't about to delete
# every single redirect.
if [[ "${#ITEMS_TO_ADD[@]}" -lt 1 ]]; then
    error "${RED}No items found to add, why are we running?${RESET}"
    exit 1
fi

echo -e "${GREEN}The redirects.csv is valid!${RESET}"
exit 0
