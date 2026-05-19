---
name: PR Review Checklist (personalDetailsList)
overview: A comprehensive pre-commit/pre-review checklist for every PR in the personalDetailsList migration, ensuring parameter design, TODO comments, call site correctness, component hygiene, and verification are all correct.
todos: []
isProject: false
---

# PR Review Checklist (personalDetailsList Migration)

Apply this checklist to **every PR** in the migration. All items must pass before committing.

Reference issue: `https://github.com/Expensify/App/issues/66413`
Plan file: [.cursor/plans/thread_personaldetailslist_plan_8fb5bf64.plan.md](.cursor/plans/thread_personaldetailslist_plan_8fb5bf64.plan.md)

---

## A. Parameter Design

1. **Is the new param required (no `?`, no default)?** If yes, is it placed before all optional/defaulted params in the signature?
2. **Does the function actually have a fallback, or does it just forward?** If it just forwards, it must NOT have a "Remove fallback" TODO comment. Only the terminal function that actually reads from the module-level variable (e.g., `isOptimisticPersonalDetail`, `isTestTransactionReport`) should have the fallback.
3. **Is the param as narrow as possible?** If the function only needs one entry from the collection, accept that entry (e.g., `PersonalDetails | null | undefined`) -- not the whole `PersonalDetailsList`. The caller should do the lookup. The full collection is only justified when the function computes the key internally (e.g., from `report.participants`).
4. **Is the param type correct per the plan rules?** Use the narrowest type:
  - `number | undefined` -- when only `.accountID` is needed
  - `string | undefined` -- when only `.login` is needed
  - `PersonalDetails | null | undefined` -- when a single entry's fields are needed
  - `OnyxEntry<PersonalDetailsList>` -- when arbitrary lookups by accountID are needed
  - `OnyxEntry<PersonalDetails>` (currentUserPersonalDetails) -- when multiple current-user fields are needed
5. **Does the `delegateEmail` interaction rule apply?** If adding `currentUserPersonalDetails` to a builder that already has `delegateEmailParam`, the new param must go **after** `delegateEmailParam` to avoid conflicts with in-flight delegateEmail PRs.

---

## B. TODO Comments

1. **Does every `undefined` pass-through have a TODO comment?** Including callers that rely on defaults (passing fewer args) -- not just the ones that explicitly write `undefined`.
2. **Does every TODO comment name the specific function that provides the fallback?** Not the intermediate function that just forwards. Example: `isTestTransactionReport falls back to...` -- not `buildOptimisticReportPreview falls back to...`.
3. **Does every TODO comment reference the specific PR number that will thread the real value?** The PR number must match the plan file. Example: `will be threaded in PR 26` must correspond to `pr-26` in the plan.
4. **Does every TODO comment use the correct issue link?** The link must be exactly `https://github.com/Expensify/App/issues/66413`. No typos, no different issue numbers, no missing link. Cross-check every comment against the plan file.
5. **Does every TODO comment follow the strict format from the plan rules?** Format: `// TODO: Pass <paramName> in PR <N>; <fallbackFunctionName> falls back to module-level Onyx value (https://github.com/Expensify/App/issues/66413)`. When there are multiple `undefined` values, each must be labeled separately.

---

## C. Call Site Updates

1. **Have ALL callers been updated?** Including action files, test files, and internal ReportUtils calls -- not just component callers. Use grep to find every call site of the modified function.
2. **After reordering params, have all positional callers been shifted correctly?** Especially callers that pass args beyond the moved param. Verify each positional arg matches the signature index.

---

## D. Component Callers

1. **Is the `useOnyx` subscription as narrow as possible?** If the component only needs a boolean or a single derived value, use a selector instead of fetching the whole collection. This prevents unnecessary re-renders.
2. **Is any `useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)` (full list) justified?** It is only justified if the function being called legitimately needs the full list (e.g., it computes the key internally, or the lookup key is not the collection key). If not, narrow it with a selector.
3. **Are component values sourced correctly?** `personalDetailsList` from `useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)`, `currentUserPersonalDetails` from `useCurrentUserPersonalDetails()`.

---

## E. Fallback Integrity

1. **Does the terminal function have the fallback pattern active if ANY caller passes `undefined`?** The fallback must be `param ?? moduleLevelVariable` (e.g., `managerPersonalDetail ?? allPersonalDetails?.[managerID]`). If this PR adds `undefined` callers, the fallback MUST already exist or be added first.
2. **Would this cause a regression if `undefined` is passed?** Trace the `undefined` all the way through any forwarding functions to the terminal function with the fallback and confirm `param ?? moduleVar` exists there. Do not stop at intermediate forwarding functions.

---

## F. Verification

1. **Does `typecheck-tsgo` pass?** Run `npm run typecheck-tsgo` and confirm exit code 0.
2. **Does `prettier` report no changes?** Run `npx prettier --write <changed files>` on all modified files.
3. **Does `eslint` pass on modified files?** Run `npx eslint <changed files> --max-warnings=0`. Pre-existing warnings (e.g., `rulesdir/no-onyx-connect`) are acceptable only if they are NOT introduced by this PR.
4. **Are tests added/updated per the plan?** Existing tests updated with new param. New tests verify the param is actually used over the module-level variable (both real value and `undefined` fallback cases).

---

## G. Plan File Consistency

1. **Do all PR numbers in code comments match the plan file?** Cross-reference every `PR <N>` in code comments against the plan file's call tree and PR breakdown. If a comment says "in PR 26", verify that the plan file assigns that caller to PR 26.
2. **Is the issue link in every comment identical to the plan file's reference issue?** The plan file defines the canonical link as `https://github.com/Expensify/App/issues/66413`. Every code comment must use this exact URL -- no variations, no trailing slashes, no different issue numbers.
3. **Is the plan file updated after this PR?** Mark the PR status as `completed` once merged.

