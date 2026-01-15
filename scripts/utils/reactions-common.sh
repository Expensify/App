#!/bin/bash
# =============================================================================
# Common Library for Rules Reactions Scripts
# =============================================================================
#
# Source this file in other scripts:
#   source "$(dirname "${BASH_SOURCE[0]}")/utils/reactions-common.sh"
#
# =============================================================================
# DATA STRUCTURES
# =============================================================================
#
# 1. REACTIONS DATA TABLE (Source of Truth)
#    Stored in issue body inside a <details> block with summary "RULES_REACTIONS_DATA"
#
#    Format:
#    | Prefix | Thumbs Up | Thumbs Down |
#    |--------|-----------|-------------|
#    | PERF-1 | 123456-2, 789012-1 | 345678-1 |
#    | PERF-2 | 111111-3 | |
#
#    - Prefix: Rule identifier (e.g., PERF-1, TEST-42)
#    - Thumbs Up/Down: Comma-separated "commentId-reactionCount" entries
#
# 2. AGGREGATED SUMMARY TABLE (Derived View)
#    Displayed at the top of the issue body between HTML comment markers
#
#    Format:
#    | Prefix | 👍 | 👎 |
#    |--------|-----|-----|
#    | PERF-1 | 3 | 1 |
#
#    - Shows total reaction counts per prefix (sum of all comment reactions)
#
# 3. COMMENT JSON (Input from fetch-pr-review-comments.sh)
#    {
#      "comment_id": "123456789",
#      "comment_url": "https://github.com/.../pull/123#discussion_r123456789",
#      "thumbs_up": 2,
#      "thumbs_down": 0,
#      "comment_prefix": "PERF-4"
#    }
#
# 4. MERGED DATA JSON (Internal representation)
#    {
#      "PERF-1": { "thumbs_up": "123456-2, 789012-1", "thumbs_down": "345678-1" },
#      "PERF-2": { "thumbs_up": "111111-3", "thumbs_down": "" }
#    }
#
# =============================================================================

# =============================================================================
# Constants
# =============================================================================

# Tag used for the details block containing the source of truth table
SUMMARY_TAG="RULES_REACTIONS_DATA"

# HTML comment markers for the aggregated summary section
AGGREGATED_START_MARKER="<!-- RULES_AGGREGATED_START -->"
AGGREGATED_END_MARKER="<!-- RULES_AGGREGATED_END -->"

# =============================================================================
# Input/Output Utilities
# =============================================================================

# Check if stdin has data (not a terminal)
# Usage: require_stdin || exit 1
require_stdin() {
  if [[ -t 0 ]]; then
    echo "Error: No input provided. Pipe data to stdin." >&2
    return 1
  fi
  return 0
}

# Validate JSON string
# Usage: validate_json "$json_string" || exit 1
validate_json() {
  local json="$1"
  
  if [[ -z "$json" ]] || [[ "$json" == "[]" ]] || [[ "$json" == "null" ]]; then
    echo "Error: Empty or null JSON" >&2
    return 1
  fi
  
  if ! echo "$json" | jq empty 2>/dev/null; then
    echo "Error: Invalid JSON" >&2
    return 1
  fi
  
  return 0
}

# Log message to stderr
# Usage: log "message"
log() {
  echo "$@" >&2
}

# =============================================================================
# GitHub API Functions
# =============================================================================

# Fetch issue body from GitHub
# Usage: fetch_issue_body "owner/repo" "issue_number"
fetch_issue_body() {
  local repo="$1"
  local issue_id="$2"
  
  gh api "repos/$repo/issues/$issue_id" --jq '.body // ""'
}

# Post a comment to an issue
# Usage: post_issue_comment "owner/repo" "issue_number" "comment body"
post_issue_comment() {
  local repo="$1"
  local issue_id="$2"
  local body="$3"
  
  gh api "repos/$repo/issues/$issue_id/comments" \
    -X POST \
    -f body="$body" \
    --jq '.html_url'
}

# Update issue body
# Usage: update_issue_body_api "owner/repo" "issue_number" "new body"
update_issue_body_api() {
  local repo="$1"
  local issue_id="$2"
  local body="$3"
  
  gh api "repos/$repo/issues/$issue_id" \
    -X PATCH \
    -f body="$body" \
    --jq '.html_url'
}

# =============================================================================
# Data Block Functions
# =============================================================================

# Extract content from the RULES_REACTIONS_DATA details block
# Usage: extract_data_block "$issue_body"
extract_data_block() {
  local body="$1"
  
  echo "$body" | sed -n "/<summary>$SUMMARY_TAG<\/summary>/,/<\/details>/p" | \
    sed "1d" | \
    sed '$d'
}

# Parse markdown table row
# Usage: parse_table_row "$line" -> outputs "prefix|thumbs_up|thumbs_down" or empty
parse_table_row() {
  local line="$1"
  
  # Skip empty lines, header, and separator
  if [[ -z "$line" ]] || \
     [[ "$line" =~ ^[[:space:]]*\|[[:space:]]*Prefix ]] || \
     [[ "$line" =~ ^[[:space:]]*\|[-:|[:space:]]+\|$ ]]; then
    return
  fi
  
  # Parse table row: | Prefix | Thumbs Up | Thumbs Down |
  if [[ "$line" =~ ^\|[[:space:]]*([^|]+)\|[[:space:]]*([^|]*)\|[[:space:]]*([^|]*)\| ]]; then
    local prefix thumbs_up thumbs_down
    prefix=$(echo "${BASH_REMATCH[1]}" | xargs)
    thumbs_up=$(echo "${BASH_REMATCH[2]}" | xargs)
    thumbs_down=$(echo "${BASH_REMATCH[3]}" | xargs)
    
    if [[ -n "$prefix" ]]; then
      echo "${prefix}|${thumbs_up}|${thumbs_down}"
    fi
  fi
}

# =============================================================================
# Reaction Data Functions
# =============================================================================

# Sum reaction counts from a comma-separated "id-count" string
# Usage: sum_reaction_counts "123-2, 456-1" -> outputs "3"
sum_reaction_counts() {
  local str="$1"
  local total=0
  
  if [[ -z "$str" ]]; then
    echo "0"
    return
  fi
  
  IFS=',' read -ra entries <<< "$str"
  for e in "${entries[@]}"; do
    e=$(echo "$e" | xargs)
    if [[ "$e" =~ -([0-9]+)$ ]]; then
      total=$((total + BASH_REMATCH[1]))
    fi
  done
  
  echo "$total"
}

# Check if a comment_id exists in a comma-separated "id-count" string
# Usage: comment_exists_in_data "comment_id" "data_string" && echo "exists"
comment_exists_in_data() {
  local comment_id="$1"
  local data_str="$2"
  
  if [[ -z "$data_str" ]]; then
    return 1
  fi
  
  if echo "$data_str" | grep -qE "(^|, *)${comment_id}-[0-9]+"; then
    return 0
  fi
  
  return 1
}

# Remove a comment_id entry from a comma-separated "id-count" string
# Usage: remove_comment_entry "comment_id" "data_string"
remove_comment_entry() {
  local comment_id="$1"
  local data_str="$2"
  
  echo "$data_str" | \
    sed -E "s/(^|, *)${comment_id}-[0-9]+//g" | \
    sed 's/^, *//' | \
    sed 's/, *$//' | \
    sed 's/, *, */, /g'
}

# Append a new entry to a comma-separated string
# Usage: append_entry "existing_string" "new_entry"
append_entry() {
  local existing="$1"
  local new_entry="$2"
  
  if [[ -n "$existing" ]]; then
    echo "${existing}, ${new_entry}"
  else
    echo "$new_entry"
  fi
}

# =============================================================================
# Prefix Extraction
# =============================================================================

# Extract prefix from comment body (e.g., "### ❌ PERF-4" -> "PERF-4")
# Usage: extract_prefix "$comment_body"
extract_prefix() {
  local body="$1"
  local first_line
  first_line=$(echo "$body" | head -n 1)
  
  if [[ "$first_line" =~ ^###[[:space:]]+❌[[:space:]]+([A-Za-z]+-[0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo ""
  fi
}

# =============================================================================
# Table Generation
# =============================================================================

# Generate markdown table header
# Usage: generate_table_header
generate_table_header() {
  echo "| Prefix | Thumbs Up | Thumbs Down |"
  echo "|--------|-----------|-------------|"
}

# Generate aggregated table header
# Usage: generate_aggregated_header
generate_aggregated_header() {
  echo "| Prefix | 👍 | 👎 |"
  echo "|--------|-----|-----|"
}

# Generate a details block wrapper
# Usage: generate_details_block "content"
generate_details_block() {
  local content="$1"
  
  echo "<details>"
  echo "<summary>$SUMMARY_TAG</summary>"
  echo ""
  echo "$content"
  echo ""
  echo "</details>"
}

# =============================================================================
# Body Update Functions
# =============================================================================

# Replace content between markers in a string
# Usage: replace_between_markers "$body" "$start_marker" "$end_marker" "$new_content"
replace_between_markers() {
  local body="$1"
  local start_marker="$2"
  local end_marker="$3"
  local new_content="$4"
  
  local in_block=false
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "$start_marker" ]]; then
      in_block=true
      echo "$new_content"
    elif [[ "$line" == "$end_marker" ]]; then
      in_block=false
    elif [[ "$in_block" == false ]]; then
      echo "$line"
    fi
  done <<< "$body"
}

# Replace details block with specific summary tag
# Usage: replace_details_block "$body" "$new_block"
replace_details_block() {
  local body="$1"
  local new_block="$2"
  
  local in_block=false
  local block_printed=false
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "<details>" ]] && [[ "$in_block" == false ]]; then
      if IFS= read -r next_line; then
        if [[ "$next_line" == "<summary>$SUMMARY_TAG</summary>" ]]; then
          in_block=true
          if [[ "$block_printed" == false ]]; then
            echo "$new_block"
            block_printed=true
          fi
        else
          echo "$line"
          echo "$next_line"
        fi
      else
        echo "$line"
      fi
    elif [[ "$line" == "</details>" ]] && [[ "$in_block" == true ]]; then
      in_block=false
    elif [[ "$in_block" == false ]]; then
      echo "$line"
    fi
  done <<< "$body"
}
