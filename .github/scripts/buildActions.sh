#!/bin/bash
#
# Used to precompile all Github Action node.js scripts using ncc.
# This bundles them with their dependencies into a single executable node.js script.

# In order for this script to be safely run from anywhere, we cannot use the raw relative path '../actions'
declare ACTIONS_DIR
ACTIONS_DIR="$(dirname "$(dirname "$0")")/actions"

# List of paths to all JS files that implement our GH Actions
declare -r GITHUB_ACTIONS=(
    "$ACTIONS_DIR/bumpVersion/bumpVersion.js"
    "$ACTIONS_DIR/checkDeployBlockers/checkDeployBlockers.js"
    "$ACTIONS_DIR/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy.js"
    "$ACTIONS_DIR/getDeployPullRequestList/getDeployPullRequestList.js"
    "$ACTIONS_DIR/getMergeCommitForPullRequest/getMergeCommitForPullRequest.js"
    "$ACTIONS_DIR/getReleaseBody/getReleaseBody.js"
    "$ACTIONS_DIR/isPullRequestMergeable/isPullRequestMergeable.js"
    "$ACTIONS_DIR/isStagingDeployLocked/isStagingDeployLocked.js"
    "$ACTIONS_DIR/markPullRequestsAsDeployed/markPullRequestsAsDeployed.js"
    "$ACTIONS_DIR/reopenIssueWithComment/reopenIssueWithComment.js"
    "$ACTIONS_DIR/triggerWorkflowAndWait/triggerWorkflowAndWait.js"
)

# This will be inserted at the top of all compiled files as a warning to devs.
declare -r NOTE_DONT_EDIT='/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
'

for ACTION in "${GITHUB_ACTIONS[@]}"; do
    # Build the action
    ACTION_DIR=$(dirname "$ACTION")
    ncc build "$ACTION" -o "$ACTION_DIR"

    # Prepend the warning note to the top of the compiled file
    OUTPUT_FILE="$ACTION_DIR/index.js"
    echo "$NOTE_DONT_EDIT$(cat "$OUTPUT_FILE")" > "$OUTPUT_FILE"
done
