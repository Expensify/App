#!/bin/bash
#
# K2's copy-checklist button posts CONTRIBUTOR_PLUS_CHECKLIST.md verbatim, and payment
# automation finds a finished C+ checklist by matching line 1, so line 1 is a contract.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly ROOT_DIR

CHECKLIST_PATH='contributingGuides/CONTRIBUTOR_PLUS_CHECKLIST.md'
readonly CHECKLIST_PATH

EXPECTED_HEADING='# Contributor+ Checklist:'
readonly EXPECTED_HEADING

ACTUAL_HEADING=$(head -n 1 "$ROOT_DIR/$CHECKLIST_PATH")
readonly ACTUAL_HEADING

if [[ "$ACTUAL_HEADING" == "$EXPECTED_HEADING" ]]; then
    echo "✅  Contributor+ checklist heading check passed."
    exit 0
fi

echo "::error file=$CHECKLIST_PATH,line=1::Line 1 must be exactly '$EXPECTED_HEADING', but it is '$ACTUAL_HEADING'."
echo "❌  Line 1 of $CHECKLIST_PATH is read by automation outside this repo:"
echo "      - K2's copy-checklist button posts this file verbatim as a PR comment"
echo "      - payment automation finds a finished C+ checklist by matching that first line"
echo ""
echo "    To rename the checklist on purpose, update those consumers and EXPECTED_HEADING in"
echo "    scripts/checkContributorPlusChecklistHeading.sh in the same PR."
echo "    Context: https://github.com/Expensify/App/issues/101129"
exit 1
