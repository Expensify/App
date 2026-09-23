# PR 10: the dependency-free core of `ReportActionsUtils` moves into two leaf modules

Branch `fix/no-cycle-part10-report-action-readers`, off `upstream/main` (`ed1f08698dc`). Worktree
`/Users/lukasz.modzelewski/conductor/nocycle-dev`. Patch: `OXLINT_NO_CYCLE_PR10.patch`.

## Headline number

Measured with oxlint 1.82.0, `import/no-cycle` isolated, `.oxlintrc.no-cycle.json`.

| State | findings | files in cycles |
| --- | --- | --- |
| `main` (parts 1-4 merged) | 390 | 95 |
| `main` + PR 10 | **376** | **92** |
| `main` + parts 5-9 | 218 | 66 |
| `main` + parts 5-9 + PR 10 | **206** | **63** |

**-14 findings and -3 files standalone**, -12 / -3 on top of the in-review stack. It does not depend on
parts 5-9.

## The problem

`ReportActionsUtils.ts` is a 5,200 line hub with 29 cyclic in-edges. It imports `ReportUtils`,
`Navigation`, `WorkspacesSettingsUtils` and more, so anything that imports it joins the big cluster.

But nine of its exports need nothing from that graph. They are the primitives everybody wants:
`getOriginalMessage`, `isActionOfType`, and the small `is*Action` guards built on top of it.

## What it does

Two new leaf modules, no function bodies changed:

- `src/libs/ReportActionTypeGuards.ts` (28 lines): `isActionOfType`, `isMoneyRequestAction`,
  `isModifiedExpenseAction`, `isDynamicExternalWorkflowApproveFailedAction`. Imports `CONST` and types only.
- `src/libs/ReportActionMessageUtils.ts` (51 lines): `getReportActionMessage`, `getOriginalMessage`,
  `getReportActionHtml`, `getReportActionText`, `getTextFromHtml`. Imports `@libs/Parser` and
  `ReportActionFollowupUtils/stripFollowupListFromHtml`, neither of which is in any cycle, plus the
  type-only `PartialReportAction` from `ReportUtils` (type imports are not followed by the rule).

`ReportActionsUtils` imports both and keeps exporting all nine names, so its hundreds of other consumers
are untouched. Eight consumers that imported **only** these names are repointed at the leaves:

| Consumer | What it imported |
| --- | --- |
| `AgentRuleChangeLogUtils` | `getOriginalMessage`, `isActionOfType` |
| `SpendRuleChangeLogUtils` | `getOriginalMessage`, `isActionOfType` |
| `IOUUtils` | `getOriginalMessage`, `isMoneyRequestAction` |
| `ModifiedExpenseMessage` | `getOriginalMessage`, `isModifiedExpenseAction` |
| `NextStepUtils` | `getOriginalMessage`, `isDynamicExternalWorkflowApproveFailedAction` |
| `actions/Report/DeleteReport` | `getOriginalMessage`, `isMoneyRequestAction` |
| `TaskUtils` | `getReportActionHtml`, `getReportActionText` |
| `Notification/LocalNotification/BrowserNotifications` | `getTextFromHtml` |

11 files, 2 of them new. +96 / -58. Neither new module is itself reported.

One `eslint-disable-next-line @typescript-eslint/no-deprecated` moves with `getOriginalMessage`: that
function is the accessor that replaces direct `originalMessage` reads, so it has to touch the deprecated
field. `ReportActionsUtils` was grandfathered by the seatbelt ratchet for it; a new file is not.

## Why the re-export is safe here

Part 9 recorded a trap: re-exporting a leaf from a hub can throw
`Cannot read properties of undefined` when a test does `{...jest.requireActual('@libs/Hub')}` and the
spread enumerates the re-export getter while the hub is mid-initialization.

No test spreads `jest.requireActual('@libs/ReportActionsUtils')`. The two suites that mock it
(`tests/ui/ParentNavigationSubtitleTest.tsx`, `tests/unit/useReportActionsScrollTest.tsx`) pass object
literals, which never enumerate the real module. Both were run and pass.

## Verification

All run on `upstream/main` + this change, in the dev worktree.

| Check | Result |
| --- | --- |
| `npm run typecheck` | passed, all tsconfigs |
| `npm run lint-changed` | 0 errors (after fixing 3 it found: 2 `no-deprecated` in the new file, 1 now-unused `OriginalMessage` type import in `ReportActionsUtils`) |
| `npm run react-compiler-compliance-check check-changed` | passed, both compilers |
| `npm run spell-changed` | 3 issues, all pre-existing and in untouched files (`DecisionModal.tsx`, `useReportSubmitToPopover.tsx`, `actions/IOU/UpdateMoneyRequest.ts`) |
| `npx jest ReportActionsUtilsTest AgentRuleChangeLogUtilsTest SpendRuleChangeLogUtilsTest IOUUtilsTest ModifiedExpenseMessageTest NextStepUtilsTest ClearReportActionErrorsTest showReportActionNotificationTest` | 8 suites, **736 tests passed**, 0 failed |
| `npx jest ParentNavigationSubtitleTest useReportActionsScrollTest ReportUtilsTest TaskTest ReportActionsFollowupUtilsTest` | 5 suites, **1453 tests passed**, 0 failed |
| `npx oxlint . -c .oxlintrc.no-cycle.json` | 390 -> 376 findings, 95 -> 92 files |

## What was left out

`TransactionUtils/index.ts` imports `{getOriginalMessage, getReportAction, isMoneyRequestAction}`.
`getReportAction` reads the module-scope `allReportActions` Onyx cache in `ReportActionsUtils`, so it is
not a leaf. Including that consumer would have been worth -1 finding and needed an Onyx subscription in
the new module, so it was skipped.

## Rebase onto current `origin/main` (2026-09-14)

Branch `fix/no-cycle-part10-report-action-readers-v1`, pushed. It is the part 10 content + a merge of
`origin/main`; all 22 part 1-9 PRs are in main's graph now, so the table below is the honest standalone
number, not the 390 baseline above.

| Measure | `origin/main` `f777fabb583` | + this branch |
| --- | --- | --- |
| findings / files | 268 / 84 | **256 / 81** |

Still -12 findings / -3 files, i.e. the effect did not decay. 11 files, +96 / -58 — byte-identical to the
original change.

One conflict, in `ReportActionsUtils.ts`, because main extracted more of the same neighbourhood:

- main added a `PERSONAL_CARD_CONNECTION_BROKEN_30_DAYS` variant of `isCardBrokenConnectionAction`, plus
  `getPersonalCardName` and an `is30DaysReminder` parameter on `getCardConnectionBrokenMessage` — **kept**.
- main's `getOriginalMessage` is byte-identical to the one this PR moved into
  `ReportActionMessageUtils.ts` (that file only adds the `no-deprecated` disable), and main's
  `isActionOfType` is identical to the one in `ReportActionTypeGuards.ts` — **main's copies dropped**, the
  leaf copies stay.

Verification after the merge: `npm run typecheck` passed (all tsconfigs + server);
`jest ReportActionsUtilsTest AgentRuleChangeLogUtilsTest SpendRuleChangeLogUtilsTest IOUUtilsTest
ModifiedExpenseMessageTest NextStepUtilsTest ClearReportActionErrorsTest showReportActionNotificationTest`
8 suites / **736 tests passed**; `jest ParentNavigationSubtitleTest useReportActionsScrollTest ReportUtilsTest
TaskTest ReportActionsFollowupUtilsTest` 5 suites / **1481 tests passed** (up from 1453 — main added tests);
new leaf files lint-clean, and the nine touched existing files carry 125 ESLint errors vs **127** on main's
copies of the same files (the grandfathered backlog; the change adds none — `npm run lint-changed` is clean).

