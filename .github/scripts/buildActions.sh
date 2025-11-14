#!/bin/bash
#
# Used to precompile all Github Action node.js scripts using ncc.
# This bundles them with their dependencies into a single executable node.js script.

# In order for this script to be safely run from anywhere, we cannot use the raw relative path '../actions'.
declare ACTIONS_DIR
ACTIONS_DIR="$(dirname "$(dirname "$0")")/actions/javascript"

# List of paths to all JS files that implement our GH Actions
declare -r GITHUB_ACTIONS=(
    "$ACTIONS_DIR/authorChecklist/authorChecklist.ts"
    "$ACTIONS_DIR/awaitStagingDeploys/awaitStagingDeploys.ts"
    "$ACTIONS_DIR/bumpVersion/bumpVersion.ts"
    "$ACTIONS_DIR/checkAndroidStatus/checkAndroidStatus.ts"
    "$ACTIONS_DIR/checkDeployBlockers/checkDeployBlockers.ts"
    "$ACTIONS_DIR/checkSVGCompression/checkSVGCompression.ts"
    "$ACTIONS_DIR/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy.ts"
    "$ACTIONS_DIR/formatCodeCovComment/formatCodeCovComment.ts"
    "$ACTIONS_DIR/getAndroidRolloutPercentage/getAndroidRolloutPercentage.ts"
    "$ACTIONS_DIR/getArtifactInfo/getArtifactInfo.ts"
    "$ACTIONS_DIR/getDeployPullRequestList/getDeployPullRequestList.ts"
    "$ACTIONS_DIR/getGraphiteString/getGraphiteString.ts"
    "$ACTIONS_DIR/getPreviousVersion/getPreviousVersion.ts"
    "$ACTIONS_DIR/getPullRequestDetails/getPullRequestDetails.ts"
    "$ACTIONS_DIR/getPullRequestIncrementalChanges/getPullRequestIncrementalChanges.ts"
    "$ACTIONS_DIR/isStagingDeployLocked/isStagingDeployLocked.ts"
    "$ACTIONS_DIR/markPullRequestsAsDeployed/markPullRequestsAsDeployed.ts"
    "$ACTIONS_DIR/postTestBuildComment/postTestBuildComment.ts"
    "$ACTIONS_DIR/proposalPoliceComment/proposalPoliceComment.ts"
    "$ACTIONS_DIR/reopenIssueWithComment/reopenIssueWithComment.ts"
    "$ACTIONS_DIR/reviewerChecklist/reviewerChecklist.ts"
    "$ACTIONS_DIR/validateReassureOutput/validateReassureOutput.ts"
    "$ACTIONS_DIR/verifySignedCommits/verifySignedCommits.ts"
)

# This will be inserted at the top of all compiled files as a warning to devs.
declare -r NOTE_DONT_EDIT='/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
'

# This stores all the process IDs of the ncc commands so they can run in parallel
declare ASYNC_BUILDS

for ((i=0; i < ${#GITHUB_ACTIONS[@]}; i++)); do
  ACTION=${GITHUB_ACTIONS[$i]}
  ACTION_DIR=$(dirname "$ACTION")

  # Build the action in the background
  npx ncc build --transpile-only --external encoding "$ACTION" -o "$ACTION_DIR" &
  ASYNC_BUILDS[i]=$!
done

EXIT_CODE=0
for ((i=0; i < ${#GITHUB_ACTIONS[@]}; i++)); do
  ACTION=${GITHUB_ACTIONS[$i]}
  ACTION_DIR=$(dirname "$ACTION")
  ACTION_NAME=$(basename "$ACTION" .ts)

  # Wait for the background build to finish
  if wait "${ASYNC_BUILDS[$i]}"; then
    # Prepend the warning note to the top of the compiled file
    OUTPUT_FILE="$ACTION_DIR/index.js"
    echo "$NOTE_DONT_EDIT$(cat "$OUTPUT_FILE")" > "$OUTPUT_FILE"
  else
    echo "❌ $ACTION_NAME failed to build: $ACTION_DIR/index.js" >&2
    EXIT_CODE=1
  fi
done

exit $EXIT_CODE
