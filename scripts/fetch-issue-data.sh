#!/bin/bash
# =============================================================================
# Fetch Issue Reactions Data
# =============================================================================
#
# Reads the RULES_REACTIONS_DATA table from an issue body and outputs it as JSON.
# This is useful for inspecting the current state of the source of truth.
#
# USAGE:
#   ./fetch-issue-data.sh <repo> <issue-id>
#
# ARGUMENTS:
#   repo     - Repository in "owner/repo" format (e.g., Expensify/App)
#   issue-id - GitHub issue number containing the reactions data
#
# INPUT (from issue body):
#   Expects a <details> block with summary "RULES_REACTIONS_DATA" containing:
#   | Prefix | Thumbs Up | Thumbs Down |
#   |--------|-----------|-------------|
#   | PERF-1 | 123456-2, 789012-1 | 345678-1 |
#
# OUTPUT (stdout):
#   JSON array with expanded reaction details:
#   [
#     {
#       "prefix": "PERF-1",
#       "thumbs_up": [
#         { "comment_id": "123456", "count": 2 },
#         { "comment_id": "789012", "count": 1 }
#       ],
#       "thumbs_down": [
#         { "comment_id": "345678", "count": 1 }
#       ]
#     }
#   ]
#
# EXAMPLE:
#   ./fetch-issue-data.sh Expensify/App 12345
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
# Parsing Functions
# =============================================================================

# Parse a single reaction entry (e.g., "123456-2" -> JSON object)
parse_reaction_entry() {
  local entry="$1"
  entry=$(echo "$entry" | xargs)
  
  [[ -z "$entry" ]] && return
  
  if [[ "$entry" =~ ^([0-9]+)-([0-9]+)$ ]]; then
    echo "{\"comment_id\": \"${BASH_REMATCH[1]}\", \"count\": ${BASH_REMATCH[2]}}"
  fi
}

# Parse comma-separated reaction entries into JSON array
parse_reactions_to_json() {
  local reactions_str="$1"
  
  if [[ -z "$reactions_str" || "$reactions_str" == "-" ]]; then
    echo "[]"
    return
  fi
  
  IFS=',' read -ra entries <<< "$reactions_str"
  local json_entries=()
  
  for entry in "${entries[@]}"; do
    local parsed
    parsed=$(parse_reaction_entry "$entry")
    [[ -n "$parsed" ]] && json_entries+=("$parsed")
  done
  
  if [[ ${#json_entries[@]} -eq 0 ]]; then
    echo "[]"
  else
    printf '%s\n' "${json_entries[@]}" | jq -s '.'
  fi
}

# Parse markdown table and output JSON
parse_table() {
  local table_content="$1"
  
  echo "$table_content" | while IFS= read -r line; do
    local parsed
    parsed=$(parse_table_row "$line")
    [[ -z "$parsed" ]] && continue
    
    IFS='|' read -r prefix thumbs_up thumbs_down <<< "$parsed"
    
    local thumbs_up_json thumbs_down_json
    thumbs_up_json=$(parse_reactions_to_json "$thumbs_up")
    thumbs_down_json=$(parse_reactions_to_json "$thumbs_down")
    
    jq -n \
      --arg prefix "$prefix" \
      --argjson thumbs_up "$thumbs_up_json" \
      --argjson thumbs_down "$thumbs_down_json" \
      '{prefix: $prefix, thumbs_up: $thumbs_up, thumbs_down: $thumbs_down}'
  done | jq -s '.'
}

# =============================================================================
# Main Execution
# =============================================================================

ISSUE_BODY=$(fetch_issue_body "$REPO" "$ISSUE_ID")

if [[ -z "$ISSUE_BODY" ]]; then
  log "Error: Could not fetch issue body"
  exit 1
fi

DATA_BLOCK=$(extract_data_block "$ISSUE_BODY")

if [[ -z "$DATA_BLOCK" ]]; then
  log "Error: Could not find <summary>$SUMMARY_TAG</summary> block in issue body"
  echo "[]"
  exit 0
fi

parse_table "$DATA_BLOCK"
