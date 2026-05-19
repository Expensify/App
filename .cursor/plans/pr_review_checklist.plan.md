---
name: PR Review Checklist
overview: A comprehensive pre-commit/pre-review checklist for every PR in the delegateEmail migration, ensuring parameter design, TODO comments, call site correctness, component hygiene, and verification are all correct.
todos: []
isProject: false
---

# PR Review Checklist (delegateEmail Migration)

Apply this checklist to **every PR** in the migration. All items must pass before committing.

Reference issue: `https://github.com/Expensify/App/issues/66425`
Plan file: [.cursor/plans/thread_delegateemail_incrementally_v2.plan.md](.cursor/plans/thread_delegateemail_incrementally_v2.plan.md)

---

## A. Parameter Design

1. **Is the new param required (no `?`, no default)?** If yes, is it placed before all optional/defaulted params in the signature?
2. **Does the function actually have a fallback, or does it just forward?** If it just forwards, it must NOT have a "Remove fallback" or "Falls back" TODO comment. Only the terminal builder function (e.g., `buildOptimisticAddCommentReportAction`) should have the fallback.
3. **Is the param as narrow as possible?** If the function only needs one entry from a list/collection, accept that entry (e.g., `PersonalDetails | null | undefined`) -- not the whole collection. The caller should do the lookup. If the function computes the key internally (e.g., from `report.participants`), then the full collection is justified.

---

## B. TODO Comments

1. **Does every `undefined` pass-through have a TODO comment?** Including callers that rely on defaults (passing fewer args) -- not just the ones that explicitly write `undefined`.
2. **Does every TODO comment name the specific function that provides the fallback?** Not the intermediate function that just forwards. Example: `buildOptimisticAddCommentReportAction falls back to...` -- not `addComment falls back to...`.
3. **Does every TODO comment reference the specific PR number that will thread the real value?** The PR number must match the plan file. Example: `will be threaded in PR 14` must correspond to `pr-14` in the plan.
4. **Does every TODO comment use the correct issue link?** The link must be exactly `https://github.com/Expensify/App/issues/66425` -- matching the "Reference issue" in the plan file (line 76). No typos, no different issue numbers, no missing link. Cross-check every comment against the plan file.
5. **Does every TODO comment follow the strict format from Rule 4 in the plan?** Format: `// <paramName>: will be threaded in PR <N>; <builderFunctionName> falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)`. When there are multiple `undefined` values, each must be labeled separately.

---

## C. Call Site Updates

1. **Have ALL callers been updated?** Including action files, test files, and internal ReportUtils calls -- not just component callers. Use `grep` to find every call site of the modified function.
2. **After reordering params, have all positional callers been shifted correctly?** Especially callers that pass args beyond the moved param. Verify each positional arg matches the signature index.

---

## D. Component Callers

1. **Is the `useOnyx` subscription as narrow as possible?** If the component only needs a boolean or a single derived value, use a selector (e.g., `{selector: (list) => isOptimisticPersonalDetail(accountID, list?.[accountID])}`) instead of fetching the whole collection. This prevents unnecessary re-renders.
2. **Is any `useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)` (full list) justified?** It is only justified if the function being called legitimately needs the full list (e.g., it computes the key internally, or the lookup key is not the collection key). If not, narrow it with a selector.

---

## E. Fallback Integrity

1. **Does the builder have the fallback pattern active if ANY caller passes `undefined`?** Check the plan file's "PRs that NEED the fallback" list (plan lines 110-117). If this PR's builder is listed, the fallback `delegateEmailParam ?? delegateEmail` (or `delegateAccountIDParam ?? (delegateEmail ? getPersonalDetailByEmail(delegateEmail)?.accountID : undefined)`) must exist.
2. **Would this cause a regression if `undefined` is passed?** Trace the `undefined` all the way to the function with the fallback and confirm `param ?? moduleVar` exists there. Do not stop at intermediate forwarding functions.

---

## F. Verification

1. **Does `typecheck-tsgo` pass?** Run `npm run typecheck-tsgo` and confirm exit code 0.
2. **Does `prettier` report no changes?** Run `npx prettier --check <changed files>` on all modified files and confirm "All matched files use Prettier code style!".
3. **Does `eslint` pass on modified files?** Run `npx eslint <changed files> --max-warnings=0`. Pre-existing warnings (e.g., `rulesdir/no-onyx-connect`) are acceptable only if they are NOT introduced by this PR.
4. **Are tests added/updated per the plan?** Existing tests updated with new param. New tests verify the param is actually used over the module-level variable (both `number` value and `undefined` cases).

---

## G. Plan File Consistency

1. **Do all PR numbers in code comments match the plan file?** Cross-reference every `PR <N>` in code comments against the plan file's call tree and PR breakdown. If a comment says "will be threaded in PR 11", verify that the plan file assigns that caller to PR 11.
2. **Is the issue link in every comment identical to the plan file's reference issue?** The plan file (line 76) defines the canonical link as `https://github.com/Expensify/App/issues/66425`. Every code comment must use this exact URL -- no variations, no trailing slashes, no different issue numbers.
