#!/bin/bash
# =============================================================================
# Post Negative Feedback Comment
# =============================================================================
#
# Posts a notification comment to an issue when a rule receives negative feedback.
# Called by update-issue-reactions.sh when new thumbs-down reactions are detected.
#
# USAGE:
#   ./post-negative-feedback-comment.sh <repo> <issue-id> '<json>'
#   echo '<json>' | ./post-negative-feedback-comment.sh <repo> <issue-id>
#
# ARGUMENTS:
#   repo     - Repository in "owner/repo" format (e.g., Expensify/App)
#   issue-id - GitHub issue number to post comment to
#   json     - (optional) JSON object, can also be piped via stdin
#
# INPUT (JSON):
#   {
#     "prefix": "PERF-4",
#     "comment_id": "123456789",
#     "comment_url": "https://github.com/owner/repo/pull/123#discussion_r123456789"
#   }
#
# OUTPUT:
#   Posts a comment to the issue in format:
#   "[PERF-4] received negative feedback in https://github.com/..."
#
#   Returns the posted comment URL to stdout.
#
# EXAMPLE:
#   ./post-negative-feedback-comment.sh Expensify/App 12345 \
#     '{"prefix":"PERF-4","comment_id":"123","comment_url":"https://..."}'
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/reactions-common.sh"

# =============================================================================
# Arguments
# =============================================================================

REPO="${1:?Usage: $0 <repo> <issue-id> [json]}"
ISSUE_ID="${2:?Usage: $0 <repo> <issue-id> [json]}"
JSON_INPUT="${3:-}"

# =============================================================================
# Input Handling
# =============================================================================

if [[ -z "$JSON_INPUT" ]]; then
  require_stdin || {
    echo "Usage: $0 <repo> <issue-id> [json]" >&2
    exit 1
  }
  JSON_INPUT=$(cat)
fi

validate_json "$JSON_INPUT" || exit 1

# =============================================================================
# Extract and Validate Fields
# =============================================================================

PREFIX=$(echo "$JSON_INPUT" | jq -r '.prefix')
COMMENT_URL=$(echo "$JSON_INPUT" | jq -r '.comment_url')

[[ -z "$PREFIX" || "$PREFIX" == "null" ]] && { log "Error: Missing 'prefix' in input"; exit 1; }
[[ -z "$COMMENT_URL" || "$COMMENT_URL" == "null" ]] && { log "Error: Missing 'comment_url' in input"; exit 1; }

# =============================================================================
# Post Comment
# =============================================================================

COMMENT_BODY="[${PREFIX}] received negative feedback in ${COMMENT_URL}"

log "Posting comment to issue #$ISSUE_ID: $COMMENT_BODY"
post_issue_comment "$REPO" "$ISSUE_ID" "$COMMENT_BODY"
