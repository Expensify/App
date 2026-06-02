#!/bin/bash
# Validates that a PR did not regress the Mobile-Expensify submodule gitlink on E/App.
#
# Inputs:
#   - Run from the App repo root (CI: PR merge commit with fetch-depth >= 2). Compares main vs HEAD gitlinks for Mobile-Expensify.
#   - MOBILE_EXPENSIFY_GIT_DIR: path to a Mobile-Expensify clone for ancestry checks (default: Mobile-Expensify submodule; CI sets .github/mobile-expensify-repo).
#
# Outputs:
#   - Exit 0 if the gitlink is unchanged or the PR SHA is not older than main's SHA (logs a success line).
#   - Exit 1 if the PR SHA regressed; writes GitHub Actions ::error:: messages with remediation steps.
set -euo pipefail

MOBILE_EXPENSIFY_GIT_DIR="${MOBILE_EXPENSIFY_GIT_DIR:-Mobile-Expensify}"

# CI checks out the PR merge commit (fetch-depth 2 includes main as HEAD^1). Local runs fetch main instead.
if git rev-parse --verify -q 'HEAD^2^{commit}' >/dev/null; then
    MAIN_REF='HEAD^1'
else
    git fetch origin main --no-tags --depth=1
    MAIN_REF='origin/main'
fi

if git diff --quiet "${MAIN_REF}"...HEAD -- Mobile-Expensify; then
    echo "✅  Mobile-Expensify submodule unchanged."
    exit 0
fi

MAIN_SHA=$(git rev-parse "${MAIN_REF}:Mobile-Expensify")
PR_SHA=$(git rev-parse HEAD:Mobile-Expensify)

echo "App main submodule: $MAIN_SHA"
echo "PR submodule: $PR_SHA"

if ! git -C "$MOBILE_EXPENSIFY_GIT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    echo "::error::Mobile-Expensify repo not found at $MOBILE_EXPENSIFY_GIT_DIR (workflow must check out Expensify/Mobile-Expensify first)"
    exit 1
fi

git -C "$MOBILE_EXPENSIFY_GIT_DIR" fetch --no-tags origin "$MAIN_SHA" "$PR_SHA"

if git -C "$MOBILE_EXPENSIFY_GIT_DIR" merge-base --is-ancestor "$MAIN_SHA" "$PR_SHA"; then
    echo "✅  PR Mobile-Expensify submodule is not older than main."
    exit 0
fi

echo "::error::Mobile-Expensify submodule was manually set to $PR_SHA, which is older than the commit on main ($MAIN_SHA)."
echo "::error::OSBotify manages this submodule. Remove the submodule change from this PR."
echo "::error::If App and Mobile-Expensify are out of sync, run the syncVersions workflow: https://github.com/Expensify/App/actions/workflows/syncVersions.yml"
exit 1
