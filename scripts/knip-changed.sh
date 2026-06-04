#!/bin/bash
#
# Run the same knip delta check the CI workflow runs, against your local main.
# Generates knip reports for the current branch and main, then compares them
# with scripts/compareKnipReports.ts.
#
# Uses a temporary git worktree so your working directory is untouched.
# Reuses your current node_modules (symlinked) — fine for static analysis as
# long as dependencies haven't changed dramatically. If main has drifted
# locally, run `git pull --rebase origin main` first; this script will not
# fetch on your behalf.
#
set -euo pipefail

WORKTREE_DIR=$(mktemp -d /tmp/knip-main-worktree.XXXXXX)
CURRENT_REPORT=$(mktemp /tmp/knip-current.XXXXXX.json)
MAIN_REPORT=$(mktemp /tmp/knip-main.XXXXXX.json)

cleanup() {
    git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
    rm -f "$CURRENT_REPORT" "$MAIN_REPORT"
}
trap cleanup EXIT

echo "Running knip on current branch..."
npm run knip:json > "$CURRENT_REPORT"

echo "Running knip on main..."
git worktree add --detach "$WORKTREE_DIR" main >/dev/null
ln -s "$PWD/node_modules" "$WORKTREE_DIR/node_modules"
(cd "$WORKTREE_DIR" && npm run knip:json) > "$MAIN_REPORT"

echo ""
npx ts-node ./scripts/compareKnipReports.ts --mainPath="$MAIN_REPORT" --prPath="$CURRENT_REPORT"
