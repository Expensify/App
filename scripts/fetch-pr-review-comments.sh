#!/bin/bash
# =============================================================================
# Fetch PR Review Comments
# =============================================================================
#
# Fetches review comments from open PRs by a specific author, filtered by reactions.
# Extracts rule prefixes from comment bodies (pattern: "### ❌ PREFIX-NUMBER").
#
# USAGE:
#   ./fetch-pr-review-comments.sh <author> <since-date> [repo] [reactions]
#
# ARGUMENTS:
#   author     - GitHub username to filter comments by (e.g., "github-actions[bot]")
#   since-date - Only PRs updated since this date, format: YYYY-MM-DD
#   repo       - Repository in "owner/repo" format (default: Expensify/App)
#   reactions  - Comma-separated reaction types to filter (default: "+1,-1")
#                Available: +1, -1, laugh, hooray, confused, heart, rocket, eyes
#                Use "none" to skip reaction filtering
#
# OUTPUT (stdout):
#   JSON array of comment objects:
#   [
#     {
#       "comment_id": "123456789",
#       "comment_url": "https://github.com/owner/repo/pull/123#discussion_r123456789",
#       "thumbs_up": 2,
#       "thumbs_down": 0,
#       "comment_prefix": "PERF-4"    <- Extracted from "### ❌ PERF-4" in comment body
#     }
#   ]
#
# EXAMPLE:
#   ./fetch-pr-review-comments.sh github-actions[bot] 2025-01-01 Expensify/App "+1,-1"
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/reactions-common.sh"

# =============================================================================
# Arguments
# =============================================================================

AUTHOR="${1:?Usage: $0 <author> <since-date> [repo] [reactions]}"
SINCE_DATE="${2:?Usage: $0 <author> <since-date> [repo] [reactions]}"
REPO="${3:-Expensify/App}"
REACTIONS="${4:-+1,-1}"

# =============================================================================
# Functions
# =============================================================================

# Build jq reaction filter expression
build_reaction_filter() {
  local reactions="$1"
  
  [[ "$reactions" == "none" ]] && { echo "true"; return; }
  
  local filter=""
  IFS=',' read -ra REACTION_ARRAY <<< "$reactions"
  
  for reaction in "${REACTION_ARRAY[@]}"; do
    reaction=$(echo "$reaction" | xargs)
    [[ -n "$filter" ]] && filter="$filter or "
    
    if [[ "$reaction" == "+1" || "$reaction" == "-1" ]]; then
      filter="$filter.reactions[\"$reaction\"] > 0"
    else
      filter="$filter.reactions.$reaction > 0"
    fi
  done
  
  echo "($filter)"
}

# Process comments and extract structured data
process_comments() {
  jq -r '.[] | @base64' | while read -r encoded_comment; do
    local comment id url thumbs_up thumbs_down body prefix
    
    comment=$(echo "$encoded_comment" | base64 --decode)
    id=$(echo "$comment" | jq -r '.id')
    url=$(echo "$comment" | jq -r '.html_url // .url')
    thumbs_up=$(echo "$comment" | jq -r '.reactions["+1"] // 0')
    thumbs_down=$(echo "$comment" | jq -r '.reactions["-1"] // 0')
    body=$(echo "$comment" | jq -r '.body')
    prefix=$(extract_prefix "$body")
    
    jq -n \
      --arg id "$id" \
      --arg url "$url" \
      --argjson thumbs_up "$thumbs_up" \
      --argjson thumbs_down "$thumbs_down" \
      --arg prefix "$prefix" \
      '{
        comment_id: $id,
        comment_url: $url,
        thumbs_down: $thumbs_down,
        thumbs_up: $thumbs_up,
        comment_prefix: $prefix
      }'
  done | jq -s '.'
}

# =============================================================================
# Main Execution
# =============================================================================

REACTION_FILTER=$(build_reaction_filter "$REACTIONS")

log "Fetching review comments by '$AUTHOR' from open PRs in '$REPO' updated since $SINCE_DATE"
log "Filtering by reactions: $REACTIONS"
log "=========================================="

# Collect all results and combine into single JSON array
{
  gh api search/issues -X GET \
    -f q="repo:$REPO is:pr is:open updated:>=$SINCE_DATE" \
    -f per_page=100 \
    --paginate \
    --jq '.items[].number' | while read -r pr_number; do
    
    log "=== PR #$pr_number ==="
    gh api "repos/$REPO/pulls/$pr_number/comments" \
      --paginate \
      --jq "[.[] | select(.user.login == \"$AUTHOR\" and $REACTION_FILTER)]" | process_comments
  done
} | jq -s 'add // []'
