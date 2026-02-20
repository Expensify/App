#!/bin/bash

# Detects self-contradicting review comments — ones that flag a violation
# then walk it back ("actually this is correct", "no change needed", etc.).
#
# Usage: filterContradictions.sh <body>
#   Exits 0 if the body is clean (no contradiction).
#   Exits 1 if the body contradicts itself; reason printed to stderr.
#
# The body text has code fences stripped before matching to avoid
# false positives on quoted code examples.

set -eu

readonly BODY="${1:-}"

if [[ -z "$BODY" ]]; then
    # Empty body is not a contradiction — let caller handle validation.
    exit 0
fi

# ---------------------------------------------------------------------------
# Strip fenced code blocks (``` ... ```) so patterns inside code examples
# don't trigger false positives. Works by removing lines between triple-
# backtick fences, inclusive.
# ---------------------------------------------------------------------------
strip_code_fences() {
    local text="$1"
    echo "$text" | sed '/^```/,/^```/d'
}

CLEAN_BODY=$(strip_code_fences "$BODY")

# Lowercase for case-insensitive matching.
LOWER_BODY=$(echo "$CLEAN_BODY" | tr '[:upper:]' '[:lower:]')

# ---------------------------------------------------------------------------
# Pattern layers — each is a separate check. If any matches, the comment
# is considered self-contradicting.
#
# Layer 1: Retraction phrases — explicit walk-backs
# Layer 2: Concession + reversal — pivot patterns
# Layer 3: Dismissive conclusions — tail dismissals
# ---------------------------------------------------------------------------

# Layer 1: Retraction phrases
RETRACTION_PATTERNS=(
    'actually[, ]*this is correct'
    'actually[, ]*(this |it )*(is |looks )*(already |perfectly )*(fine|correct|right|proper|valid|appropriate)'
    'on second (thought|review|look)'
    'false alarm'
    'false positive'
    'my mistake'
    'i was wrong'
    'i stand corrected'
    'never\s*mind'
    'nevermind'
    'disregard (this|the above|my)'
    'i retract'
    'i take (that|this|it) back'
    'scratch that'
)

# Layer 2: Concession + reversal
CONCESSION_PATTERNS=(
    '(however|but|wait)[, ]*(i see|this is|it is|that is|it looks|that looks)[ ]*(actually )?(fine|correct|right|valid|proper|appropriate|intentional|expected)'
    'upon (further|closer) (review|inspection|look|reading)'
    'after (further|closer) (review|inspection|look|reading)'
    'looking (more )?closely[, ]*(this|it) (is|seems|appears|looks) (fine|correct|right|valid)'
    'on closer (inspection|look|review)'
    'wait[, ]*(i see|actually|never)'
)

# Layer 3: Dismissive conclusions
DISMISSIVE_PATTERNS=(
    'no (change|changes|action|fix|modification)[s]? (is |are )?(needed|required|necessary)'
    'not (actually )?(an issue|a problem|a bug|a concern|incorrect|wrong)'
    'can be (safely )?ignored'
    'this (is|seems|appears) (to be )?(intentional|by design|expected|deliberate)'
    'not (actually )?a violation'
    'this (comment|review|feedback) (is|was) (unnecessary|not needed|not applicable)'
    '(ignore|disregard) (this|the above) (comment|review|feedback|suggestion)'
)

check_patterns() {
    local layer_name="$1"
    shift
    local patterns=("$@")
    for pattern in "${patterns[@]}"; do
        if echo "$LOWER_BODY" | grep -qE "$pattern"; then
            echo "Contradiction detected ($layer_name): matched pattern '$pattern'" >&2
            return 0
        fi
    done
    return 1
}

if check_patterns "retraction" "${RETRACTION_PATTERNS[@]}"; then
    exit 1
fi

if check_patterns "concession+reversal" "${CONCESSION_PATTERNS[@]}"; then
    exit 1
fi

if check_patterns "dismissive conclusion" "${DISMISSIVE_PATTERNS[@]}"; then
    exit 1
fi

# No contradiction detected — comment is clean.
exit 0
