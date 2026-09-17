#!/bin/bash
#
# Run the same knip delta check the CI workflow runs, against the merge base
# with origin/main. Generates knip reports for the current branch and the
# merge base, then compares them with scripts/compareKnipReports.ts.
#
# Uses a temporary git worktree so your working directory is untouched.
# Reuses your current node_modules (symlinked) — fine for static analysis as
# long as dependencies haven't changed dramatically.
#
set -euo pipefail

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

WORKTREE_DIR=$(mktemp -d /tmp/knip-main-worktree.XXXXXX)
CURRENT_REPORT=$(mktemp /tmp/knip-current.XXXXXX.json)
MAIN_REPORT=$(mktemp /tmp/knip-main.XXXXXX.json)

cleanup() {
    git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
    rm -f "$CURRENT_REPORT" "$MAIN_REPORT"
}
trap cleanup EXIT

info "Fetching origin/main"
MERGE_BASE_SHA_HASH="$(get_merge_base_with_main)"
readonly MERGE_BASE_SHA_HASH

echo "Running knip on current branch..."
npm run knip:json > "$CURRENT_REPORT"

echo "Running knip on merge base (${MERGE_BASE_SHA_HASH})..."
git worktree add --detach "$WORKTREE_DIR" "$MERGE_BASE_SHA_HASH" >/dev/null
ln -s "$PWD/node_modules" "$WORKTREE_DIR/node_modules"
(cd "$WORKTREE_DIR" && npm run knip:json) > "$MAIN_REPORT"

echo ""
bun ./scripts/compareKnipReports.ts --mainPath="$MAIN_REPORT" --prPath="$CURRENT_REPORT"
