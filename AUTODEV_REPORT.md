# AUTODEV Report

## Issue
- #83130 - Rule - Offline deleted rules reappear after reconnecting until cache is cleared
- URL: https://github.com/Expensify/App/issues/83130

## Changed Files
- `src/libs/actions/Policy/Policy.ts`
  - Filtered duplicated `codingRules` to exclude rules with `pendingAction: DELETE`.
- `src/pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm.tsx`
  - Updated merchant rules count to ignore rules with `pendingAction: DELETE`.
- `tests/actions/PolicyTest.ts`
  - Added regression test: `duplicate workspace excludes coding rules marked for deletion`.

## Test Commands
1. `npm test -- tests/actions/PolicyTest.ts -t "duplicate workspace excludes coding rules marked for deletion"`
2. `npx prettier --write src/libs/actions/Policy/Policy.ts src/pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm.tsx tests/actions/PolicyTest.ts`
3. `npx eslint src/libs/actions/Policy/Policy.ts src/pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm.tsx tests/actions/PolicyTest.ts --max-warnings=0`
4. `npx eslint src/libs/actions/Policy/Policy.ts src/pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm.tsx tests/actions/PolicyTest.ts`
5. `npm test -- tests/actions/PolicyTest.ts -t "duplicate workspace excludes coding rules marked for deletion"`

## Results
- Targeted regression test initially failed (expected), confirming repro at code level.
- After fix, targeted regression test passes.
- Prettier reports files are formatted.
- ESLint reports **0 errors** and **4 pre-existing warnings** in `src/libs/actions/Policy/Policy.ts` (`rulesdir/no-onyx-connect`), so `--max-warnings=0` fails due existing repository warnings, not this change.

## Risks
- Change intentionally excludes `pendingAction: DELETE` coding rules from duplication payload; if any flow expected pending-deleted rules to be copied for later reconciliation, that behavior no longer occurs.
- UI count now reflects only active coding rules, so displayed count can be lower than raw key count in cached policy objects containing deleted placeholders.
