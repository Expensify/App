# PR 9: three pure helpers move into leaf modules

Branch `fix/no-cycle-part9-leaf-extractions`, off `upstream/main` (`b63843bd645`). Worktree `/tmp/part9-pr`.
Patch: `OXLINT_NO_CYCLE_PR9.patch`.

## Headline number

Measured with oxlint 1.82.0, `import/no-cycle` isolated.

| State | findings | files in cycles |
| --- | --- | --- |
| `main` (parts 1-4 merged) | 390 | 95 |
| `main` + PR 9 | **372** | **91** |
| `main` + parts 5-8 | 229 | 70 |
| `main` + parts 5-8 + PR 9 | **218** | **66** |

**-18 findings and -4 files standalone.** Like PR 8, it pays off without waiting for the in-review PRs.

## What it does

Same shape as part 2: three unrelated small cycles, each broken by moving one pure function into a leaf.
No function bodies change.

| Edge cut | Moved to | Δ |
| --- | --- | --- |
| `fileDownload/DownloadUtils -> actions/Link` | `src/libs/openExternalLink.ts` | -7, -3 files |
| `ReportUtils -> PaymentUtils` | `src/libs/getBankAccountLastFourDigits.ts` | -4, -1 file |
| `SearchUIUtils -> TransactionPreviewUtils` | `src/libs/getIOUPayerAndReceiver.ts` | -7, -1 file |

### 1. `openExternalLink`

`fileDownload/DownloadUtils.ts` did `import * as Link from '@userActions/Link'` and used exactly
`Link.openExternalLink` twice. That function is 3 lines wrapping `asyncOpenURL`, which is not in any
cycle, while `actions/Link` reaches into the report and session layers.

It moves to `src/libs/openExternalLink.ts`. `actions/Link` imports it back and keeps exporting it, so
its other consumers are untouched. `DownloadUtils` imports the leaf directly, which also clears a
pre-existing `no-restricted-syntax` error there (namespace imports from `@libs` are banned), taking that
file from 2 lint errors to 1.

### 2. `getBankAccountLastFourDigits`

`ReportUtils` imported this one function from `PaymentUtils`. It is 12 lines, pure, and has zero value
imports: it takes the bank account list as a parameter. It moves to
`src/libs/getBankAccountLastFourDigits.ts`; `PaymentUtils` imports it back and keeps exporting it.

### 3. `getIOUPayerAndReceiver`

`SearchUIUtils` imported this one function from `TransactionPreviewUtils`. It is 14 lines, pure, and its
only local dependency was the `emptyPersonalDetails` constant, which moves with it. It has exactly two
consumers, `SearchUIUtils` and `TransactionPreviewContent.tsx`, and both are repointed at the leaf, so
`TransactionPreviewUtils` does **not** re-export it and `emptyPersonalDetails` is removed there as dead
code.

10 files, 3 of them new. +87 / -60.

None of the three new modules is itself reported.

## Verification

All run on `upstream/main` + this change.

| Check | Result |
| --- | --- |
| `npm run typecheck` | passed, all tsconfigs |
| `npx eslint` on all 7 changed source files | every count at pristine-`main` baseline or better (`DownloadUtils` improves 2 -> 1; `Link.ts` 7, `PaymentUtils` 2, `ReportUtils` 103, `SearchUIUtils` 74, `TransactionPreviewUtils` 1, `TransactionPreviewContent` 3 all unchanged). All 3 new files 0 errors |
| `npm run react-compiler-compliance-check check-changed` | passed, both compilers |
| `npx cspell` on all 10 changed files | 0 issues |
| `npx jest ReportUtilsTest PaymentUtilsTest Search/SearchUIUtilsTest LinkTest` | 4 suites, **1900 tests passed**, 0 failed |
| `npx jest TransactionPreviewUtils.test TransactionPreviewContentTest` | 2 suites, **83 tests passed**, 0 failed |
| `npx oxlint . -c .oxlintrc.no-cycle.json` | 390 -> 372 findings, 95 -> 91 files |

## Two candidates built, measured, then dropped

Both were implemented and measured before being reverted. They are recorded here so nobody spends the
time again.

### `SubscriptionUtils -> PolicyUtils` (-4, -1 file): breaks `ReportUtilsTest`

`SubscriptionUtils` imports `{getOwnedPaidPolicies, isPolicyOwner}` from `PolicyUtils`. All three
relevant predicates (`isPolicyOwner`, `isPaidGroupPolicy`, `getOwnedPaidPolicies`) are one or two line
`CONST` comparisons, so a `PolicyPredicates.ts` leaf with `PolicyUtils` re-exporting looks trivial.

It typechecks and cuts the edge, but it breaks `tests/unit/ReportUtilsTest.ts`:

```
TypeError: Cannot read properties of undefined (reading 'getOwnedPaidPolicies')
  at Object.get [as getOwnedPaidPolicies] (src/libs/PolicyUtils.ts:99:30)
  at tests/unit/ReportUtilsTest.ts:352:5
  at Object.require (src/libs/actions/connections/index.ts:6:1)
  at Object.require (src/libs/PolicyUtils.ts:51:1)
  at requireActual (tests/unit/ReportUtilsTest.ts:350:36)
```

The test does `jest.mock('@libs/PolicyUtils', () => ({...jest.requireActual('@libs/PolicyUtils'), ...}))`.
The spread enumerates every export, including the new re-export getter, while `PolicyUtils` is still
mid-initialization: it is at line 51 requiring `./actions/connections`, which re-enters through the
cycle, and the `./PolicyPredicates` require has not run yet.

It can be made to pass by moving the `./PolicyPredicates` import to the front of `PolicyUtils`'s
relative import group, but that means the file only works because of require ordering inside a 65-import
module, which `import/order` will also fight. That is the same class of latent trap this effort exists to
remove, so it was dropped rather than papered over. The three symbols are imported from `PolicyUtils` in
48, 22 and 10 files respectively, so making the leaf canonical instead of re-exporting is its own PR.

### `SearchQueryUtils -> CardFeedUtils` (-6, -3 files): too large

`SearchQueryUtils` imports `getCardFeedsForDisplay`. The function itself is 53 lines, but it needs
`getOriginalCompanyFeeds`, `getCustomOrFormattedFeedName`, `getCompanyFeedSubtitle` and
`getExpensifyCardFeedsForDisplay`, which would drag most of `CardFeedUtils` along. Passing the result in
as a parameter instead would change the signatures of `getFilterDisplayValue` and
`getDisplayQueryFiltersForKey` and ripple to all their callers. Neither is small.

## Unrelated pre-existing failures

`tests/unit/SubscriptionUtilsTest.ts` has 4 failing tests (free-trial date arithmetic, for example
`Expected: 5, Received: 6`). Verified: the same 4 fail on a pristine `upstream/main` checkout at
`b63843bd645`. Nothing to do with this PR, which does not touch that file.
