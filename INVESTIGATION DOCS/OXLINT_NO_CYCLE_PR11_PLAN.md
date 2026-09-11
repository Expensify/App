# PR 11: policy category Onyx builders and `sortAlphabetically` move into leaf modules

Branch `fix/no-cycle-part11-policy-category-and-sort`, off `upstream/main` (`ed1f08698dc`). Worktree
`/Users/lukasz.modzelewski/conductor/nocycle-dev`. Patch: `OXLINT_NO_CYCLE_PR11.patch`.

## Headline number

Measured with oxlint 1.82.0, `import/no-cycle` isolated, `.oxlintrc.no-cycle.json`.

| State | findings | files in cycles |
| --- | --- | --- |
| `main` (parts 1-4 merged) | 390 | 95 |
| `main` + PR 11 | **379** | **93** |
| `main` + parts 5-9 | 218 | 66 |
| `main` + parts 5-9 + PR 11 | **189** | **61** |

**-11 findings and -2 files standalone, -29 findings and -5 files on top of the in-review stack.** This is
the largest stacked payoff of any part since PR 5, and the gap is the point: the two edges it cuts are the
last cyclic in-edges of the `OptionsListUtils` subtree once parts 5-9 have landed, so removing them drops
`getChatPreviewParts`, `AttendeeUtils` and the `OptionsListUtils` barrel out of the cluster together.

Order of merge does not matter for correctness, only for how the delta is attributed.

## Two edges, two leaves

### 1. `actions/Policy/Policy -> actions/Policy/Category` (-6 / -1 standalone)

`Policy.ts` imported exactly three things from `Category.ts`:
`buildOptimisticMccGroup`, `buildOptimisticPolicyCategories`, `buildOptimisticPolicyWithExistingCategories`.
All three are pure Onyx-payload builders. `Category.ts` itself imports `ReportUtils`, `PolicyUtils`,
`OptionsListUtils`, `fileDownload` and the task action layer, so the edge dragged all of that in.

The three builders plus the `DEFAULT_MCC_GROUP` constant they depend on move to
`src/libs/actions/Policy/PolicyCategoriesOnyxData.ts` (165 lines). Its only value imports are
`getMicroSecondOnyxErrorWithTranslationKey` from `ErrorUtils`, `CONST`, `ONYXKEYS` and `Onyx`, none of
which is in a cycle.

`Category.ts` imports them back and keeps exporting all four names, so `MerchantTypeRulesUtils`
(`DEFAULT_MCC_GROUP`, `isDefaultMccGroupID`) is untouched. `isDefaultMccGroupID` and its
`DefaultMccGroupID` type stay in `Category.ts`; they only read `CONST`. `Policy.ts` imports the leaf
directly, so the edge disappears entirely rather than being re-routed.

### 2. `AttendeeUtils -> OptionsListUtils` (-5 / -1 standalone)

`AttendeeUtils` imported exactly one name, `sortAlphabetically`: a two-line generic sort that takes the
locale comparator as a parameter. It moves to `src/libs/sortAlphabetically.ts` (13 lines, one type-only
import).

**The re-export does not work here.** First attempt kept `sortAlphabetically` re-exported from
`OptionsListUtils`, which is what parts 6, 7 and 9 do for their hubs. Two suites then failed:

```
TypeError: Cannot read properties of undefined (reading 'default')
  at Object.get [as sortAlphabetically] (src/libs/OptionsListUtils/index.ts:51:32)
  at requireActual (tests/unit/useGroupChatDraftParticipantSyncTest.ts:21:25)
  ...
  at Object.require (src/libs/OptionsListUtils/index.ts:16:1)
```

(`tests/unit/useGroupChatDraftParticipantSyncTest.ts` and
`tests/ui/BaseVacationDelegateSelectionComponentTest.tsx`, both of which spread
`jest.requireActual('@libs/OptionsListUtils')`.)

This is the exact hazard part 9 documented for `PolicyUtils`: the spread enumerates the re-export getter
while `OptionsListUtils` is mid-initialization at its line 16 (`@libs/Navigation/Navigation`), long
before the `@libs/sortAlphabetically` require at line 70 has run.

So the leaf is made canonical instead: `OptionsListUtils` no longer exports `sortAlphabetically` at all,
and all 15 consumers import it directly. That is a wider diff but it removes the getter, so the result
does not depend on require ordering inside a 130-import module. Both suites pass.

Four UI suites had `sortAlphabetically` entries inside `jest.mock('@libs/OptionsListUtils', ...)` that
are now dead; they are removed and those suites still pass against the real sort.

25 files, 2 of them new. +206 / -177.

## Verification

All run on `upstream/main` + this change.

| Check | Result |
| --- | --- |
| `npm run typecheck` | passed, all tsconfigs |
| `npm run lint-changed` | 0 errors (after fixing 2 it found: an `import/order` placement in `Category.ts`, and a banned `@libs` namespace import in the new leaf) |
| `npm run react-compiler-compliance-check check-changed` | passed, both compilers |
| `npm run spell-changed` | 3 issues, all pre-existing and in untouched files |
| `npx jest useGroupChatDraftParticipantSyncTest BaseVacationDelegateSelectionComponentTest OptionsListUtilsTest AttendeeUtilsTest PolicyCategoryTest PolicyTest ChangeReceiptBillingAccountPageTest AssignCardAssigneeStepTest IssueNewCardAssigneeStepTest ReportSubmitToContentTest useSearchSelectorTest` | 11 suites, **641 tests passed**, 0 failed |
| `npx jest AccountSwitcherTest ApproverSelectionListTest WorkspaceMembersSelectionListTest DomainGroupPreferredWorkspacePageTest` | 4 suites, **21 tests passed**, 0 failed |
| `npx oxlint . -c .oxlintrc.no-cycle.json` | 390 -> 379 findings, 95 -> 93 files |

## What was left out

- `OptionsListUtils/index -> OptionsListUtils/getChatPreviewParts` (-5 / -1). The barrel really calls
  `getChatPreviewParts` at `src/libs/OptionsListUtils/index.ts:310`, inside a core option-building
  function. Breaking it means moving that function out of the barrel, which is a part-6-sized change.
- `actions/IOU/MoneyRequestBuilder -> actions/Policy/Tag` (-6 / -1 standalone, **0** stacked, the edge is
  already out of the cluster after parts 5-9). `buildOptimisticPolicyRecentlyUsedTags` needs
  `PolicyUtils.getSortedTagKeys` and `TransactionUtils.getTagArrayFromName`, both in the cluster, so the
  leaf would import them and `Tag.ts` would import the leaf, re-closing the cycle through it. It needs
  those two helpers extracted first, or the values passed in as parameters.
- `actions/Report/index -> actions/Policy/Member` (-5 / -1). `buildRoomMembersOnyxData` and the 148-line
  `buildAddMembersToWorkspaceOnyxData` need `ReportUtils` and `PolicyUtils`, and `Member.ts` uses both
  internally, so a leaf holding them would sit back inside the cluster. Same shape as the Tag case.
