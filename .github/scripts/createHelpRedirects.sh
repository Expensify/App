#!/bin/bash
#
# Adds new routes to the Cloudflare Bulk Redirects list for communityDot to helpDot
# pages. Does some basic sanity checking.
# set -x
source ../../scripts/shellUtils.sh

info "Adding any new redirects from communityDot to helpDot"

declare -r LIST_ID="20eb13215038446a98fd69ccf6d1026d"
declare -r ZONE_ID="$CLOUDFLARE_ACCOUNT_ID"
declare -r REDIRECTS_FILE="../../docs/redirects.csv"

function checkCloudflareResult {
    RESULTS=$1
    RESULT_MESSAGE=$(echo "$RESULTS" | jq .success)

    if ! [[ "$RESULT_MESSAGE" == "true" ]]; then
        ERROR_MESSAGE=$(echo "$RESULTS" | jq .errors)
        error "Error calling Cloudfalre API: $ERROR_MESSAGE"
        exit 1
    fi
}

LIST_RESULT=$(curl -s --request GET --url "https://api.cloudflare.com/client/v4/accounts/$ZONE_ID/rules/lists/$LIST_ID/items" \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $CLOUDFLARE_LIST_TOKEN")

checkCloudflareResult "$LIST_RESULT"

# Build an array of all of the current directs, each line is a csv of source,destination
read -r -a CURRENT_REDIRECTS < <(echo "$LIST_RESULT" | jq -r '.result[].redirect | "\(.source_url),\(.target_url)"' | tr '\n' ' ')
declare -a ITEMS_TO_ADD

while read -r line; do
    # Split each line of the file into a source and destination so we can sanity check
    # and compare against the current list.
    read -r -a LINE_PARTS < <(echo "$line" | tr ',' ' ')
    SOURCE_URL=${LINE_PARTS[0]}
    DEST_URL=${LINE_PARTS[1]}
    FOUND=false

    # Make sure the format of the line is as execpted.
    if [[ "${#LINE_PARTS[@]}" -gt 2 ]]; then
        error "Found a line with more than one comma: $line"
        exit 1
    fi

    # Basic sanity checking to make sure that the source and destination are in expected
    # subdomains.
    if ! [[ $SOURCE_URL =~ ^https://community\.expensify\.com ]]; then
        error "Found source URL that is not a community URL: $SOURCE_URL"
        exit 1
    fi

    if ! [[ $DEST_URL =~ ^https://help\.expensify\.com ]]; then
        error "Found destination URL that is not a help URL: $DEST_URL"
        exit 1
    fi

    info "Source: $SOURCE_URL and destination: $DEST_URL appear to be formatted correctly."

    # This will get slow if we get to a ton of entries but there's no better way to do this in bash v3
    # because associative arrays do not exist.
    for entry in "${CURRENT_REDIRECTS[@]}"; do
        read -r -a ENTRY_PARTS < <(echo "$entry" | tr ',' ' ')
        CURRENT_SOURCE_URL=${ENTRY_PARTS[0]}
        CURRENT_DEST_URL=${ENTRY_PARTS[1]}

        # If the current csv line matches an existing rule, skip.
        if [[ "$SOURCE_URL" == "$CURRENT_SOURCE_URL" ]] && [[ "$DEST_URL" == "$CURRENT_DEST_URL" ]]; then
            echo "$SOURCE_URL is already mapped to $DEST_URL, skipping."
            FOUND=true
            break
        fi
    done

    if [[ $FOUND == true ]]; then
        continue
    fi

    # If we've made it this far, this csv line doesn't match any existing rules
    # so we need to do add it.
    info "$SOURCE_URL was not found in the existing list mapped to $DEST_URL, adding it."
    ITEMS_TO_ADD+=("$line")

# This line skips the first line in the csv because the first line is a header row.
done <<< "$(tail +2 $REDIRECTS_FILE)"

# Sanity check that we should actually be running this.
if [[ "${#ITEMS_TO_ADD[@]}" -lt 1 ]]; then
    error "No items found to add, why are we running?"
    exit 1
fi

# This block builds a single JSON object with all of our updates so we can
# reduce the number of API calls we make. You cannot add any logging or anything
# that prints to std out to this block or it will break. We capture all of the std out
# from this loop and pass it to jq to build the json object. Any non-json will break the
# jq call at the end.
POST_JSON=$(for new in "${ITEMS_TO_ADD[@]}"; do
    read -r -a LINE_PARTS < <(echo "$new" | tr ',' ' ')
    SOURCE_URL=${LINE_PARTS[0]}
    DEST_URL=${LINE_PARTS[1]}
    jq -n --arg source "$SOURCE_URL" --arg dest "$DEST_URL" '{"redirect": {source_url: $source, target_url: $dest}}'
done | jq -n '. |= [inputs]')

info "Adding redirects for $POST_JSON"

POST_RESULT=$(curl -s --request POST --url "https://api.cloudflare.com/client/v4/accounts/$ZONE_ID/rules/lists/$LIST_ID/items" \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $CLOUDFLARE_LIST_TOKEN" \
    --data "$POST_JSON")

checkCloudflareResult "$POST_RESULT"

success "Updated lists successfully"
