#!/bin/bash

# Renders VERIFY_PODFILE_PREBUILT_REMEDY.md's {{ARTIFACT_TARGET}}/{{POD_INSTALL_CMD}} placeholders
# for the given Podfile.lock path and prints the result to stdout. Called from two places - the
# check script (to show it in the job log) and the CI workflow (to post it as a PR comment) - so
# both always show the exact same repo-specific instructions.
#
# Usage: renderVerifyPodfilePrebuiltRemedy.sh <path-to-Podfile.lock>

set -e

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
readonly SCRIPT_DIR
ROOT_DIR=$(dirname "$(dirname "$SCRIPT_DIR")")
readonly ROOT_DIR

readonly LOCKFILE="$1"

# App's ios/Podfile.lock is the Standalone target; Mobile-Expensify's iOS/Podfile.lock is HybridApp.
if [[ "$LOCKFILE" == iOS/* ]]; then
  ARTIFACT_TARGET='HybridApp'
  POD_INSTALL_CMD='npm run pod-install'
else
  ARTIFACT_TARGET='Standalone'
  POD_INSTALL_CMD='npm run pod-install-standalone'
fi

sed -e "s/{{ARTIFACT_TARGET}}/$ARTIFACT_TARGET/" -e "s/{{POD_INSTALL_CMD}}/$POD_INSTALL_CMD/" \
  "$ROOT_DIR/.github/VERIFY_PODFILE_PREBUILT_REMEDY.md"
