#!/bin/bash
# Validates that a PR did not regress the Mobile-Expensify submodule gitlink on E/App.
#
# Inputs:
#   - Run from the App repo root after checkout (CI: PR merge commit, submodules initialized).
#   - git fetch origin main --depth=1 must be usable to read main's gitlink (script runs this).
#   - MOBILE_EXPENSIFY_GIT_DIR: clone of Expensify/Mobile-Expensify at its default branch tip (default: .github/mobile-expensify-repo).
#
# Outputs:
#   - Exit 0 if the PR gitlink matches main's gitlink, or matches Mobile-Expensify main HEAD.
#   - Exit 1 otherwise; writes GitHub Actions ::error:: messages with remediation steps.
set -euo pipefail

MOBILE_EXPENSIFY_GIT_DIR="${MOBILE_EXPENSIFY_GIT_DIR:-.github/mobile-expensify-repo}"

git fetch origin main --no-tags --depth=1

PR_HASH=$(git rev-parse HEAD:Mobile-Expensify)
MAIN_HASH=$(git rev-parse origin/main:Mobile-Expensify)

if ! git -C "$MOBILE_EXPENSIFY_GIT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    echo "::error::Mobile-Expensify repo not found at $MOBILE_EXPENSIFY_GIT_DIR (workflow must check out Expensify/Mobile-Expensify first)"
    exit 1
fi

MOBILE_EXPENSIFY_MAIN_HASH=$(git -C "$MOBILE_EXPENSIFY_GIT_DIR" rev-parse HEAD)

echo "App main submodule: $MAIN_HASH"
echo "PR submodule: $PR_HASH"
echo "Mobile-Expensify main: $MOBILE_EXPENSIFY_MAIN_HASH"

if [[ "$PR_HASH" == "$MAIN_HASH" ]]; then
    echo "✅  Mobile-Expensify submodule matches main."
    exit 0
fi

if [[ "$PR_HASH" == "$MOBILE_EXPENSIFY_MAIN_HASH" ]]; then
    echo "✅  Mobile-Expensify submodule matches Mobile-Expensify main."
    exit 0
fi

echo "::error::Mobile-Expensify submodule ($PR_HASH) does not match App main ($MAIN_HASH) or Mobile-Expensify main ($MOBILE_EXPENSIFY_MAIN_HASH)."
echo "::error::OSBotify manages this submodule. Remove the submodule change from this PR."
echo "::error::If App and Mobile-Expensify are out of sync, run the syncVersions workflow: https://github.com/Expensify/App/actions/workflows/syncVersions.yml"
exit 1
