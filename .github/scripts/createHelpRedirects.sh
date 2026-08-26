#!/bin/bash
#
# Adds new routes to the Cloudflare Bulk Redirects list for communityDot to helpDot
# pages. Sanity checking is done upstream in the PRs themselves in verifyRedirect.sh.

set -e

source scripts/shellUtils.sh

info "Adding any new redirects from communityDot to helpDot"

declare -r LIST_ID="20eb13215038446a98fd69ccf6d1026d"
declare -r ZONE_ID="$CLOUDFLARE_ACCOUNT_ID"
declare -r REDIRECTS_FILE="docs/redirects.csv"

function checkCloudflareResult {
    RESULTS=$1
    RESULT_MESSAGE=$(echo "$RESULTS" | jq .success)

    if ! [[ "$RESULT_MESSAGE" == "true" ]]; then
        ERROR_MESSAGE=$(echo "$RESULTS" | jq .errors)
        error "Error calling Cloudflare API: $ERROR_MESSAGE"
        exit 1
    fi
}

declare -a ITEMS_TO_ADD

while read -r line; do
    ITEMS_TO_ADD+=("$line")

# This line skips the first line in the csv because the first line is a header row.
done <<< "$(tail +2 $REDIRECTS_FILE)"

# Sanity check that we should actually be running this and we aren't about to delete
# every single redirect.
if [[ "${#ITEMS_TO_ADD[@]}" -lt 1 ]]; then
    error "No items found to add, why are we running?"
    exit 1
fi

# This block builds a single JSON object with all of our updates so we can
# reduce the number of API calls we make. You cannot add any logging or anything
# that prints to std out to this block or it will break. We capture all of the std out
# from this loop and pass it to jq to build the json object. Any non-json will break the
# jq call at the end.
PUT_JSON=$(for new in "${ITEMS_TO_ADD[@]}"; do
    read -r -a LINE_PARTS < <(echo "$new" | tr ',' ' ')
    SOURCE_URL=${LINE_PARTS[0]}
    DEST_URL=${LINE_PARTS[1]}

    # We strip the prefix here so that the rule will match both http and https. Since vanilla will eventially be removed,
    # we need to catch both because we will not have the http > https redirect done by vanilla anymore.
    NO_PREFIX_SOURCE_URL=${SOURCE_URL/https:\/\//}
    jq -n --arg source "$NO_PREFIX_SOURCE_URL" --arg dest "$DEST_URL" '{"redirect": {source_url: $source, target_url: $dest}}'
done | jq -n '. |= [inputs]')

info "Adding redirects for $PUT_JSON"

# Dump $PUT_JSON into a file otherwise the curl request below will fail with too many arguments
echo "$PUT_JSON" > redirects.json

# We use PUT here instead of POST so that we replace the entire list in place. This has many benefits:
# 1. We don't have to check if items are already in the list, allowing this script to run faster
# 2. We can support deleting redirects this way by simply removing them from the list
# 3. We can support updating redirects this way, in the case of typos or moved destinations.
#
# Additionally this API call is async, so after we finish it, we must poll to wait for it to finish to
# to know that it was actually completed.
PUT_RESULT=$(curl -s --request PUT --url "https://api.cloudflare.com/client/v4/accounts/$ZONE_ID/rules/lists/$LIST_ID/items" \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $CLOUDFLARE_LIST_TOKEN" \
    --data-binary @redirects.json)

checkCloudflareResult "$PUT_RESULT"
OPERATION_ID=$(echo "$PUT_RESULT" | jq -r .result.operation_id)

DONE=false

# Poll for completition
while [[ $DONE == false ]]; do
    CHECK_RESULT=$(curl -s --request GET --url "https://api.cloudflare.com/client/v4/accounts/$ZONE_ID/rules/lists/bulk_operations/$OPERATION_ID" \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $CLOUDFLARE_LIST_TOKEN")
    checkCloudflareResult "$CHECK_RESULT"

    STATUS=$(echo "$CHECK_RESULT" | jq -r .result.status)

    # Exit on completed or failed, other options are pending or running, in both cases
    # we want to keep polling.
    if [[ $STATUS == "completed" ]]; then
        DONE=true
    fi

    if [[ $STATUS == "failed" ]]; then
        ERROR_MESSAGE=$(echo "$CHECK_RESULT" | jq .result.error)
        error "List update failed with error: $ERROR_MESSAGE"
        exit 1
    fi
done

success "Updated lists successfully"
