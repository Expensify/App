#!/bin/bash
set -euo pipefail

MOBILE_EXPENSIFY_GIT_DIR="${MOBILE_EXPENSIFY_GIT_DIR:-.github/mobile-expensify-repo}"

git fetch origin main --no-tags

if git diff --quiet origin/main...HEAD -- Mobile-Expensify; then
    echo "✅  Mobile-Expensify submodule unchanged."
    exit 0
fi

MAIN_SHA=$(git rev-parse origin/main:Mobile-Expensify)
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
