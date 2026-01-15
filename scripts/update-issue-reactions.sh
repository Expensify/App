#!/bin/bash
# =============================================================================
# Update Issue Reactions Data
# =============================================================================
#
# Merges new comment reaction data into the RULES_REACTIONS_DATA table in an issue.
# Also regenerates the aggregated summary table and posts notifications for new
# negative feedback.
#
# USAGE:
#   ./fetch-pr-review-comments.sh ... | ./update-issue-reactions.sh <repo> <issue-id>
#
# ARGUMENTS:
#   repo     - Repository in "owner/repo" format (e.g., Expensify/App)
#   issue-id - GitHub issue number to update
#
# INPUT (stdin):
#   JSON array from fetch-pr-review-comments.sh:
#   [
#     {
#       "comment_id": "123456789",
#       "comment_url": "https://github.com/.../pull/123#discussion_r123456789",
#       "thumbs_up": 2,
#       "thumbs_down": 0,
#       "comment_prefix": "PERF-4"
#     }
#   ]
#
# BEHAVIOR:
#   1. Fetches current issue body and parses existing RULES_REACTIONS_DATA table
#   2. For each incoming comment:
#      - If it has new negative feedback (thumbs_down > 0, not in source of truth),
#        posts a notification comment via post-negative-feedback-comment.sh
#      - Merges the reaction data into the table (updates existing or adds new)
#   3. Regenerates the aggregated summary table from the merged data
#   4. Updates the issue body with both tables
#
# OUTPUT:
#   - Updates issue body with new data
#   - May post notification comments for new negative feedback
#   - Outputs the updated issue URL to stdout
#
# EXAMPLE:
#   ./fetch-pr-review-comments.sh github-actions[bot] 2025-01-01 | \
#     ./update-issue-reactions.sh Expensify/App 12345
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/reactions-common.sh"

# =============================================================================
# Arguments
# =============================================================================

REPO="${1:?Usage: $0 <repo> <issue-id>}"
ISSUE_ID="${2:?Usage: $0 <repo> <issue-id>}"

# =============================================================================
# Input Validation
# =============================================================================

require_stdin || {
  echo "Usage: ./fetch-pr-review-comments.sh ... | $0 <repo> <issue-id>" >&2
  exit 1
}

INPUT=$(cat)
validate_json "$INPUT" || {
  log "Input received: $INPUT"
  exit 1
}

# =============================================================================
# Table Parsing Functions
# =============================================================================

# Parse existing table into JSON object (different from fetch-issue-data.sh format)
parse_existing_table() {
  local table_content="$1"
  
  [[ -z "$table_content" ]] && { echo "{}"; return; }
  
  local result="{}"
  
  while IFS= read -r line; do
    local parsed
    parsed=$(parse_table_row "$line")
    [[ -z "$parsed" ]] && continue
    
    IFS='|' read -r prefix thumbs_up thumbs_down <<< "$parsed"
    
    result=$(echo "$result" | jq \
      --arg prefix "$prefix" \
      --arg thumbs_up "$thumbs_up" \
      --arg thumbs_down "$thumbs_down" \
      '.[$prefix] = {thumbs_up: $thumbs_up, thumbs_down: $thumbs_down}')
  done <<< "$table_content"
  
  echo "$result"
}

# =============================================================================
# Table Generation Functions
# =============================================================================

# Generate markdown table from data object
generate_data_table() {
  local data="$1"
  
  generate_table_header
  echo "$data" | jq -r 'to_entries | sort_by(.key) | .[] | "| \(.key) | \(.value.thumbs_up) | \(.value.thumbs_down) |"'
}

# Generate full data block with details wrapper
generate_data_block() {
  local data="$1"
  local table
  table=$(generate_data_table "$data")
  generate_details_block "$table"
}

# Generate aggregated summary table
generate_aggregated_table() {
  local data="$1"
  
  echo "$AGGREGATED_START_MARKER"
  echo "## Rules Reactions Summary"
  echo ""
  generate_aggregated_header
  
  local prefixes
  prefixes=$(echo "$data" | jq -r 'keys | sort | .[]')
  
  while IFS= read -r prefix; do
    [[ -z "$prefix" ]] && continue
    
    local thumbs_up_str thumbs_down_str thumbs_up_total thumbs_down_total
    thumbs_up_str=$(echo "$data" | jq -r --arg p "$prefix" '.[$p].thumbs_up // ""')
    thumbs_down_str=$(echo "$data" | jq -r --arg p "$prefix" '.[$p].thumbs_down // ""')
    thumbs_up_total=$(sum_reaction_counts "$thumbs_up_str")
    thumbs_down_total=$(sum_reaction_counts "$thumbs_down_str")
    
    echo "| $prefix | $thumbs_up_total | $thumbs_down_total |"
  done <<< "$prefixes"
  
  echo ""
  echo "$AGGREGATED_END_MARKER"
}

# =============================================================================
# Body Update Functions
# =============================================================================

# Update data block in issue body
update_data_block() {
  local original_body="$1"
  local new_data_block="$2"
  
  if echo "$original_body" | grep -q "<summary>$SUMMARY_TAG</summary>"; then
    replace_details_block "$original_body" "$new_data_block"
  else
    [[ -n "$original_body" ]] && { echo "$original_body"; echo ""; }
    echo "$new_data_block"
  fi
}

# Update aggregated table in issue body
update_aggregated_section() {
  local original_body="$1"
  local new_aggregated_table="$2"
  
  if echo "$original_body" | grep -q "$AGGREGATED_START_MARKER"; then
    replace_between_markers "$original_body" "$AGGREGATED_START_MARKER" "$AGGREGATED_END_MARKER" "$new_aggregated_table"
  else
    echo "$new_aggregated_table"
    [[ -n "$original_body" ]] && { echo ""; echo "$original_body"; }
  fi
}

# Update both sections in issue body
update_full_body() {
  local original_body="$1"
  local new_data_block="$2"
  local new_aggregated_table="$3"
  
  local body_with_data
  body_with_data=$(update_data_block "$original_body" "$new_data_block")
  update_aggregated_section "$body_with_data" "$new_aggregated_table"
}

# =============================================================================
# Comment Processing
# =============================================================================

# Process a single comment and merge into data
process_comment() {
  local comment="$1"
  local merged_data="$2"
  local existing_data="$3"
  
  local prefix comment_id comment_url thumbs_up thumbs_down
  prefix=$(echo "$comment" | jq -r '.comment_prefix')
  comment_id=$(echo "$comment" | jq -r '.comment_id')
  comment_url=$(echo "$comment" | jq -r '.comment_url')
  thumbs_up=$(echo "$comment" | jq -r '.thumbs_up')
  thumbs_down=$(echo "$comment" | jq -r '.thumbs_down')
  
  # Skip comments without a prefix
  if [[ -z "$prefix" || "$prefix" == "null" || "$prefix" == "" ]]; then
    log "Skipping comment $comment_id (no prefix)"
    echo "$merged_data"
    return
  fi
  
  log "Processing comment $comment_id for prefix $prefix (👍:$thumbs_up 👎:$thumbs_down)"
  
  # Check for NEW negative feedback
  local source_thumbs_down
  source_thumbs_down=$(echo "$existing_data" | jq -r --arg p "$prefix" '.[$p].thumbs_down // ""')
  
  if [[ "$thumbs_down" -gt 0 ]]; then
    if ! comment_exists_in_data "$comment_id" "$source_thumbs_down"; then
      log "New negative feedback detected for $prefix from comment $comment_id"
      # Redirect stdout to stderr to avoid corrupting JSON output
      "$SCRIPT_DIR/post-negative-feedback-comment.sh" "$REPO" "$ISSUE_ID" \
        "$(jq -n --arg prefix "$prefix" --arg comment_id "$comment_id" --arg comment_url "$comment_url" \
          '{prefix: $prefix, comment_id: $comment_id, comment_url: $comment_url}')" >&2
    fi
  fi
  
  # Get current values and remove old entries for this comment
  local existing_thumbs_up existing_thumbs_down
  existing_thumbs_up=$(echo "$merged_data" | jq -r --arg p "$prefix" '.[$p].thumbs_up // ""')
  existing_thumbs_down=$(echo "$merged_data" | jq -r --arg p "$prefix" '.[$p].thumbs_down // ""')
  
  existing_thumbs_up=$(remove_comment_entry "$comment_id" "$existing_thumbs_up")
  existing_thumbs_down=$(remove_comment_entry "$comment_id" "$existing_thumbs_down")
  
  # Add new entries
  [[ "$thumbs_up" -gt 0 ]] && existing_thumbs_up=$(append_entry "$existing_thumbs_up" "${comment_id}-${thumbs_up}")
  [[ "$thumbs_down" -gt 0 ]] && existing_thumbs_down=$(append_entry "$existing_thumbs_down" "${comment_id}-${thumbs_down}")
  
  # Update and return merged data
  echo "$merged_data" | jq \
    --arg prefix "$prefix" \
    --arg thumbs_up "$existing_thumbs_up" \
    --arg thumbs_down "$existing_thumbs_down" \
    '.[$prefix] = {thumbs_up: $thumbs_up, thumbs_down: $thumbs_down}'
}

# =============================================================================
# Main Execution
# =============================================================================

log "Fetching current issue #$ISSUE_ID from $REPO..."

ISSUE_BODY=$(fetch_issue_body "$REPO" "$ISSUE_ID")
DATA_BLOCK=$(extract_data_block "$ISSUE_BODY")
EXISTING_DATA=$(parse_existing_table "$DATA_BLOCK")

log "Parsing input data..."

MERGED_DATA="$EXISTING_DATA"

while read -r comment; do
  MERGED_DATA=$(process_comment "$comment" "$MERGED_DATA" "$EXISTING_DATA")
done < <(echo "$INPUT" | jq -c '.[]')

# Generate updated content
NEW_DATA_BLOCK=$(generate_data_block "$MERGED_DATA")
NEW_AGGREGATED_TABLE=$(generate_aggregated_table "$MERGED_DATA")
NEW_BODY=$(update_full_body "$ISSUE_BODY" "$NEW_DATA_BLOCK" "$NEW_AGGREGATED_TABLE")

log "Updating issue #$ISSUE_ID..."
update_issue_body_api "$REPO" "$ISSUE_ID" "$NEW_BODY"

log "Done!"
