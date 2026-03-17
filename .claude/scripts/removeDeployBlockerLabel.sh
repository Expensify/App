#!/bin/bash

# Secure proxy script to remove deploy blocker labels from GitHub issues.
# Only allows removing specific labels: DeployBlocker, DeployBlockerCash
set -eu

readonly ALLOWED_LABELS=("DeployBlocker" "DeployBlockerCash")

die() {
    echo "Error: $*" >&2
    exit 1
}

usage() {
    die "Usage: $0 <issue_url> <label>"
}

validate_label() {
    local label="$1"
    for allowed in "${ALLOWED_LABELS[@]}"; do
        if [[ "$label" == "$allowed" ]]; then
            return 0
        fi
    done
    die "Label '$label' is not allowed. Allowed labels: ${ALLOWED_LABELS[*]}"
}

readonly ISSUE_URL="${1:-}"
readonly LABEL="${2:-}"

[[ -z "$ISSUE_URL" || -z "$LABEL" ]] && usage

# Validate the URL looks like a GitHub issue URL
if [[ ! "$ISSUE_URL" =~ ^https://github\.com/.+/issues/[0-9]+$ ]]; then
    die "Invalid issue URL format. Expected: https://github.com/<owner>/<repo>/issues/<number>"
fi

validate_label "$LABEL"

echo "Removing label '$LABEL' from issue: $ISSUE_URL"
gh issue edit "$ISSUE_URL" --remove-label "$LABEL"
