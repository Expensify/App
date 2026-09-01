#!/bin/bash

# Requires a link to the companion Mobile-Expensify PR whenever an App PR changes the dependency
# list in ios/Podfile.lock.
#
# The same native dependency graph has two lockfiles: ios/Podfile.lock for standalone NewDot and
# Mobile-Expensify/iOS/Podfile.lock for HybridApp. A Mobile-Expensify merge reaches App as a direct
# push to main with no pull request, so nothing else links the two halves of such a change.
#
# Usage: verifyPodfileCompanionPR.sh <base-sha> <head-sha>
# Reads the pull request description from PR_BODY.

set -e

BASE_SHA="$1"
HEAD_SHA="$2"

if [[ -z "$BASE_SHA" || -z "$HEAD_SHA" ]]; then
  echo "Usage: $0 <base-sha> <head-sha>" >&2
  exit 1
fi

# Three dots, so the comparison starts where the branch diverged. A two-dot diff against the base
# branch tip also reports, inverted, every lockfile change that landed on main in the meantime.
if ! LOCKFILE_DIFF=$(git diff "$BASE_SHA...$HEAD_SHA" -- ios/Podfile.lock); then
  echo "Error: could not diff ios/Podfile.lock between $BASE_SHA and $HEAD_SHA" >&2
  exit 1
fi

# Dependency entries are two-space-dash lines. The PODFILE CHECKSUM: line moves whenever the Podfile
# is edited at all, including for logic that changes no dependency, and SPEC CHECKSUMS are derived.
DEPENDENCY_DIFF=$(grep -E '^[+-]  - ' <<< "$LOCKFILE_DIFF" || true)

if [[ -z "$DEPENDENCY_DIFF" ]]; then
  echo "✓ No dependency changes in ios/Podfile.lock; no companion Mobile-Expensify PR needed."
  exit 0
fi

# The same link tells the HybridApp AdHoc build which Mobile-Expensify PR to build against
# (resolveBuildRefs.yml), so one entry covers both. The template ships it with a <PR-number>
# placeholder, which the [0-9]+ here rejects.
if grep -qE 'MOBILE-EXPENSIFY:[[:space:]]*https://github\.com/Expensify/Mobile-Expensify/pull/[0-9]+' <<< "$PR_BODY"; then
  echo "✓ Dependencies changed in ios/Podfile.lock and a companion Mobile-Expensify PR is linked."
  exit 0
fi

# Opt out for a change that genuinely cannot reach HybridApp, e.g. a revert opened during an
# incident. A reason is required so the claim is reviewable.
if grep -qE 'NO-HYBRIDAPP-IMPACT:[[:space:]]*[^[:space:]]' <<< "$PR_BODY"; then
  echo "✓ Dependencies changed in ios/Podfile.lock; PR declares no HybridApp impact."
  exit 0
fi

echo ""
echo "❌ This PR changes the dependencies in ios/Podfile.lock but links no Mobile-Expensify PR."
echo ""
echo "   Dependencies that changed:"
sed 's/^/     /' <<< "$DEPENDENCY_DIFF"
echo ""
cat <<'MESSAGE'
   HybridApp keeps its own lockfile at Mobile-Expensify/iOS/Podfile.lock, and it does not update
   itself. Without a matching change there, the HybridApp build resolves a different native
   dependency graph than the one you tested here.

   To fix:

     1. Regenerate the HybridApp lockfile from the repository root, with this branch checked out:

          npm run pod-install

        That updates Mobile-Expensify/iOS/Podfile.lock in your working copy of the submodule.
        (`npm run pod-install-standalone` regenerates ios/Podfile.lock; neither command does both.)

     2. Open a Mobile-Expensify PR with that change and link it in this PR's description:

          MOBILE-EXPENSIFY: https://github.com/Expensify/Mobile-Expensify/pull/<PR-number>

        Link it while it is still open: the AdHoc build resolves this link to the PR's head, so a
        link added after merging builds OldDot from a stale snapshot.

     3. Land the two together - the Mobile-Expensify PR first, so its submodule bump reaches App
        main before this PR merges.

   If your change genuinely cannot affect HybridApp, say why in this PR's description:

     NO-HYBRIDAPP-IMPACT: <reason>
MESSAGE

echo ""
exit 1
