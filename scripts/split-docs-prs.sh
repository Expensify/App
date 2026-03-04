#!/bin/bash
#
# Split the current branch's docs changes into multiple smaller PRs.
# Run from repo root. Current branch should have all docs changes (e.g. helpsite-integration-error-revamp).
# Each run creates ONE new branch from main with one subset of files; run multiple times for multiple PRs.
#
# Usage:
#   ./scripts/split-docs-prs.sh 1   # creates pr-docs-netsuite (174 files)
#   ./scripts/split-docs-prs.sh 2   # creates pr-docs-quickbooks-desktop (117 files)
#   ./scripts/split-docs-prs.sh 3   # creates pr-docs-sage-intacct (84 files)
#   ./scripts/split-docs-prs.sh 4   # creates pr-docs-quickbooks-online (71 files)
#   ./scripts/split-docs-prs.sh 5   # creates pr-docs-xero (60 files)
#   ./scripts/split-docs-prs.sh 6   # creates pr-docs-other (certinia, TriNet, reports-and-expenses, etc.)
#
# Then push each branch and open a PR:  git push -u origin pr-docs-netsuite

set -e
SOURCE_BRANCH=$(git branch --show-current)
MAIN_BRANCH=main

case "$1" in
  1)
    NEW_BRANCH="pr-docs-netsuite"
    PATHS="docs/articles/expensify-classic/connections/netsuite docs/articles/new-expensify/connections/netsuite"
    ;;
  2)
    NEW_BRANCH="pr-docs-quickbooks-desktop"
    PATHS="docs/articles/expensify-classic/connections/quickbooks-desktop docs/articles/new-expensify/connections/quickbooks-desktop"
    ;;
  3)
    NEW_BRANCH="pr-docs-sage-intacct"
    PATHS="docs/articles/expensify-classic/connections/sage-intacct docs/articles/new-expensify/connections/sage-intacct"
    ;;
  4)
    NEW_BRANCH="pr-docs-quickbooks-online"
    PATHS="docs/articles/expensify-classic/connections/quickbooks-online docs/articles/new-expensify/connections/quickbooks-online"
    ;;
  5)
    NEW_BRANCH="pr-docs-xero"
    PATHS="docs/articles/expensify-classic/connections/xero docs/articles/new-expensify/connections/xero"
    ;;
  6)
    NEW_BRANCH="pr-docs-other"
    # Certinia, TriNet (single file), and all non-connections docs
    PATHS="docs/articles/expensify-classic/connections/certinia docs/articles/expensify-classic/connect-credit-cards docs/articles/expensify-classic/expenses docs/articles/expensify-classic/workspaces docs/articles/new-expensify/reports-and-expenses docs/articles/new-expensify/workspaces docs/articles/new-expensify/wallet-and-payments docs/articles/new-expensify/insights docs/articles/new-expensify/getting-started docs/articles/new-expensify/settings docs/articles/new-expensify/domains docs/articles/new-expensify/billing-and-subscriptions docs/articles/new-expensify/concierge-ai docs/articles/travel/company-setup"
    ;;
  *)
    echo "Usage: $0 <1-6>"
    echo "  1 = NetSuite (both platforms)"
    echo "  2 = QuickBooks Desktop (both platforms)"
    echo "  3 = Sage Intacct (both platforms)"
    echo "  4 = QuickBooks Online (both platforms)"
    echo "  5 = Xero (both platforms)"
    echo "  6 = Other (Certinia, TriNet, reports-and-expenses, workspaces, etc.)"
    exit 1
    ;;
esac

echo "Source branch: $SOURCE_BRANCH"
echo "New branch:    $NEW_BRANCH"
echo "Paths:         $PATHS"
echo ""
read -p "Create $NEW_BRANCH from $MAIN_BRANCH and copy these paths from $SOURCE_BRANCH? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[yY]$ ]]; then
  echo "Aborted."
  exit 0
fi

git fetch origin "$MAIN_BRANCH" 2>/dev/null || true
git checkout -b "$NEW_BRANCH" "origin/$MAIN_BRANCH" 2>/dev/null || git checkout -b "$NEW_BRANCH" "$MAIN_BRANCH"
for p in $PATHS; do
  if git ls-tree --name-only "$SOURCE_BRANCH" -- "$p" 2>/dev/null | head -1 >/dev/null; then
    git checkout "$SOURCE_BRANCH" -- "$p"
    echo "  checked out: $p"
  fi
done
# PR 6: include single file TriNet.md
if [ "$1" = "6" ]; then
  git checkout "$SOURCE_BRANCH" -- "docs/articles/expensify-classic/connections/TriNet.md" 2>/dev/null && echo "  checked out: TriNet.md" || true
fi

FILE_COUNT=$(git diff --name-only --cached | wc -l)
echo ""
echo "Done. $FILE_COUNT files staged."
echo "Commit and push:"
echo "  git add -A && git commit -m 'Docs: [describe this PR]'"
echo "  git push -u origin $NEW_BRANCH"
echo "Then open a PR from $NEW_BRANCH to $MAIN_BRANCH."
