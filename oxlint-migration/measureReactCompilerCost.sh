#!/bin/bash
#
# What do the React Compiler rules cost, and would Oxlint's native react/* rules be a drop-in?
# See "The native aggregate, measured" in OXLINT_MIGRATION_INVESTIGATION.md for the answer this
# produced on 2026-08-11 against the old aggregate rule (short version: 47 s, and no, it
# un-checks 182 files). Oxlint 1.79.0 removed that single aggregate rule (react/react-compiler)
# and split it into 22 per-check rules; variant `d` below now enables the 12 that are exact
# twins of our rh/* rules, and the answer is unchanged (re-checked this session).
#
#   a  production config, all 16 rh/* rules in the Node sidecar        (reference)
#   b  only the 2 rules with no native twin (exhaustive-deps,
#      component-hook-factories) -- does one surviving rule keep the whole cost?
#   c  all 16 off                                                     (lower bound)
#   d  c + the 12 native per-check rules (react/refs, react/use-memo, ...)  (the swap)
#
# The `total` column is the gate: variant a must report 4629, the same figure
# `npm run compare-oxlint` reports. Anything else means the variants are linting the wrong
# file set and every number is void. See reactCompilerVariants.py for why that can happen.
#
# Order a,b,c,d,a: the two `a` runs bracket the batch, so machine drift shows up as a gap
# between them instead of being absorbed into one variant. Takes ~6 min and an idle machine.
#
# Usage:
#   ./oxlint-migration/measureReactCompilerCost.sh [output-dir]   # default /tmp
set -u
cd "$(dirname "$0")/.."

OUT="${1:-/tmp}"
RESULTS="$OUT/rc-cost.tsv"

python3 oxlint-migration/reactCompilerVariants.py write
printf 'run\tvariant\tseconds\ttotal\trh\tnative\n' >"$RESULTS"

run() {
    local run_id="$1" variant="$2" json="$OUT/rc-$2-$1.json"
    SECONDS=0
    npx oxlint -c ".oxlintrc.measure-$variant.json" --type-aware --format json >"$json" 2>/dev/null
    python3 oxlint-migration/reactCompilerVariants.py record "$json" "$run_id" "$variant" "$SECONDS" "$RESULTS"
}

run 1 a
run 1 b
run 1 c
run 1 d
run 2 a

echo
echo "== timings (variant a MUST report total=4629) =="
cat "$RESULTS"

echo
echo "== is the native per-check split a drop-in for the 12 twin sidecar rules? =="
python3 oxlint-migration/compareReactCompilerNative.py "$OUT/rc-a-1.json" "$OUT/rc-d-1.json"

rm -f .oxlintrc.measure-a.json .oxlintrc.measure-b.json .oxlintrc.measure-c.json .oxlintrc.measure-d.json
echo
echo "(variant configs removed)"
