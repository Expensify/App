---
name: Thread personalDetailsList plan
overview: Remove `Onyx.connect()` for `ONYXKEYS.PERSONAL_DETAILS_LIST` in `src/libs/ReportUtils.ts` (lines 1071-1083) by threading `personalDetailsList` and `currentUserPersonalDetails` through all consuming functions and their call chains from React components.
todos:
  - id: pr-1
    content: "PR 1: Thread currentUserAccountID through canModifyHoldStatus, canHoldUnholdReportAction, isAdminOwnerApproverOrReportOwner, isNonOwnerMangerOfIOUReport + callers"
    status: completed
  - id: pr-2
    content: "PR 2: isOptimisticPersonalDetail + isTestTransactionReport — add personalDetailsList param + component callers"
    status: pending
  - id: pr-3
    content: "PR 3: hasExpensifyGuidesEmails chain + isJoinRequestInAdminRoom chain — add params + component/HOC callers"
    status: pending
  - id: pr-4
    content: "PR 4: getChatRoomSubtitle + getParentNavigationSubtitle — add param + component callers"
    status: pending
  - id: pr-5
    content: "PR 5: getParticipantsAccountIDsForDisplay + internal forwarding — add param + component callers"
    status: pending
  - id: pr-6
    content: "PR 6: getParticipantsAccountIDsForDisplay — lib callers (OptionsListUtils, SidebarUtils, Task.ts)"
    status: pending
  - id: pr-7
    content: "PR 7: getPersonalDetailsForAccountID — update callers that omit the param"
    status: pending
  - id: pr-8
    content: "PR 8: getDisplayNameForParticipant — component callers"
    status: pending
  - id: pr-9
    content: "PR 9: getDisplayNameForParticipant — ReportNameUtils callers"
    status: pending
  - id: pr-10
    content: "PR 10: getDisplayNameForParticipant — SidebarUtils + PersonalDetailOptionsListUtils + SuggestionUtils + NextStepUtils + OptionsListUtils"
    status: pending
  - id: pr-11
    content: "PR 11: getDisplayNameForParticipant — internal ReportUtils callers batch 1"
    status: pending
  - id: pr-12
    content: "PR 12: getDisplayNameForParticipant — internal ReportUtils callers batch 2"
    status: pending
  - id: pr-13
    content: "PR 13: getTransactionDetails — component callers batch 1"
    status: pending
  - id: pr-14
    content: "PR 14: getTransactionDetails — component callers batch 2 + internal forwarding"
    status: pending
  - id: pr-15
    content: "PR 15: getTransactionDetails — action/lib callers"
    status: pending
  - id: pr-16
    content: "PR 16: getParsedComment — add param + internal wrappers + component callers"
    status: pending
  - id: pr-17
    content: "PR 17: getParsedComment — action callers batch 1 (Task, Report, Policy, Search, SendMoney, SendInvoice)"
    status: pending
  - id: pr-18
    content: "PR 18: getParsedComment — action callers batch 2 (TrackExpense, Split, IOU/index, UpdateMoneyRequest)"
    status: pending
  - id: pr-19
    content: "PR 19: buildOptimisticAddCommentReportAction — add param + callers"
    status: pending
  - id: pr-20
    content: "PR 20: getCurrentUserAvatar/DisplayNameOrEmail + buildOptimistic batch 1 — add currentUserPersonalDetails param"
    status: pending
  - id: pr-21
    content: "PR 21: buildOptimistic batch 2 — add currentUserPersonalDetails param"
    status: pending
  - id: pr-22
    content: "PR 22: buildOptimistic batch 3 — add currentUserPersonalDetails param"
    status: pending
  - id: pr-23
    content: "PR 23: buildOptimisticModifiedExpenseReportAction + DetachReceipt + TaskReportAction — add currentUserPersonalDetails param"
    status: pending
  - id: pr-24
    content: "PR 24: getTaskAssigneeChatOnyxData + prepareOnboardingOnyxData — add both params"
    status: pending
  - id: pr-25
    content: "PR 25: parseReportActionHtmlToText — add both params, forward from getReportName"
    status: pending
  - id: pr-26
    content: "PR 26: Thread through IOU/index.ts — personalDetailsList for money request creation chains"
    status: pending
  - id: pr-27
    content: "PR 27: Thread through IOU/index.ts — both params for update/cleanup chains"
    status: pending
  - id: pr-28
    content: "PR 28: Thread through IOU/index.ts — currentUserPersonalDetails for remaining buildOptimistic callers"
    status: pending
  - id: pr-29
    content: "PR 29: Thread through IOU/Split.ts + SendMoney.ts + SendInvoice.ts + Duplicate.ts + PerDiem.ts"
    status: pending
  - id: pr-30
    content: "PR 30: Thread through Report/index.ts — both params"
    status: pending
  - id: pr-31
    content: "PR 31: Thread through Task.ts + Transaction.ts + MergeTransaction.ts + Hold.ts + Receipt.ts"
    status: pending
  - id: pr-32
    content: "PR 32: Thread through Policy/Policy.ts + Policy/Member.ts + CompanyCards.ts + other small action files"
    status: pending
  - id: pr-33
    content: "PR 33: Thread through NextStepUtils + SearchUIUtils + remaining libs"
    status: pending
  - id: pr-34
    content: "PR 34 (Final): Remove Onyx.connect, make all params required, remove fallbacks"
    status: pending
isProject: false
---

# Remove Onyx.connect() for ONYXKEYS.PERSONAL_DETAILS_LIST in ReportUtils.ts

Reference issue: `https://github.com/Expensify/App/issues/66413`

## Target: Lines 1071-1083 of [src/libs/ReportUtils.ts](src/libs/ReportUtils.ts)

```typescript
let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
let allPersonalDetailLogins: string[];
let currentUserPersonalDetails: OnyxEntry<PersonalDetails>;
Onyx.connect({
  key: ONYXKEYS.PERSONAL_DETAILS_LIST,
  callback: (value) => {
    if (deprecatedCurrentUserAccountID) {
      currentUserPersonalDetails =
        value?.[deprecatedCurrentUserAccountID] ?? undefined;
    }
    allPersonalDetails = value ?? {};
    allPersonalDetailLogins = Object.values(allPersonalDetails).map(
      (personalDetail) => personalDetail?.login ?? "",
    );
  },
});
```

---

## Two values need threading

1. **`personalDetailsList: OnyxEntry<PersonalDetailsList>`** — replaces the module-level `allPersonalDetails`
2. **`currentUserPersonalDetails: OnyxEntry<PersonalDetails>`** — replaces the module-level `currentUserPersonalDetails`
3. `allPersonalDetailLogins` — derived inline from `personalDetailsList` in `getParsedComment`

**No shortcuts**:

- We do NOT use `deprecatedCurrentUserAccountID` — it comes from another `Onyx.connect` (`ONYXKEYS.SESSION`) that will also be deprecated
- We do NOT rely on action files' own Onyx connections (e.g., `IOU/index.ts`'s `allPersonalDetails`) — all values are threaded from React components through the full call chain

## Sources in React components

- `personalDetailsList` from `const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)`
- `currentUserPersonalDetails` from `useCurrentUserPersonalDetails()` hook

**Libs with existing `personalDetails` params** (just forward):
- `SidebarUtils.ts:getOptionData` — has `personalDetails: OnyxEntry<PersonalDetailsList>`
- `OptionsListUtils/index.ts` — many functions receive `personalDetails`

---

## Rules

**Fallback rule (CRITICAL):** When a function previously read a module-level variable and we add an explicit parameter, the function body MUST fall back to the module-level variable until ALL callers pass the real value. Pattern:

```typescript
function foo(report, currentUserAccountID: number | undefined): boolean {
  // TODO: Remove fallback once all callers pass currentUserAccountID (https://github.com/Expensify/App/issues/66413)
  const resolvedCurrentUserAccountID =
    currentUserAccountID ?? currentUserPersonalDetails?.accountID;
  // ... use resolvedCurrentUserAccountID ...
}
```

This ensures zero behavioral regression. The fallback is removed only in the Final PR after ALL callers pass the value.

**Parameter typing:** Use the narrowest possible type:

- `currentUserAccountID: number | undefined` — when only `.accountID` is needed
- `currentUserLogin: string | undefined` — when only `.login` is needed
- `currentUserPersonalDetails: OnyxEntry<PersonalDetails>` — when multiple fields are needed (avatar, displayName, etc.)
- `personalDetailsList: OnyxEntry<PersonalDetailsList>` — when arbitrary lookups by accountID are needed
- `personalDetailLogins: string[]` — when the full login list is needed

**Component callers:** Source values from `useCurrentUserPersonalDetails()` or `useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)`.

**Utility/action callers that don't have the value:** Pass `undefined` with a TODO comment referencing the issue. The fallback in the function body preserves existing behavior.

**Fallback guarantee (STRICT):** Before passing `undefined` for any parameter anywhere in the call tree, you MUST verify that the bottom-level builder function at the end of the chain has the fallback pattern (`param ?? moduleLevelVariable`) active. If it does not, add the fallback first. Every `undefined` comment MUST name the exact builder function that provides the fallback. Never pass `undefined` without confirming the fallback exists — this prevents silent regressions where the value is lost.

**Tests:** Every PR must update existing tests to pass the new parameter explicitly.

**Post-edit checklist:** Run prettier, eslint, typecheck-tsgo after every change.

**Line numbers:** All line numbers are verified against main as of 2026-04-09. They may shift as PRs are merged — re-verify before coding each PR.

### `delegateEmail` interaction

Two builders already have `delegateEmailParam` threaded from issue #66417:

- `buildOptimisticEditedTaskFieldReportAction({title, description}, delegateEmailParam)` (line ~8240)
- `buildOptimisticChangedTaskAssigneeReportAction(assigneeAccountID, currentUserAccountID, delegateEmailParam)` (line ~8308)

All other builders still use the module-level `delegateEmail` variable directly. When adding `currentUserPersonalDetails` param to these builders, add it **after** any existing `delegateEmailParam` to avoid conflicts with in-flight delegateEmail PRs.

---

## Progress

| PR | Status | Link |
|----|--------|------|
| 1 | Merged | [#87275](https://github.com/Expensify/App/pull/87275) |
| 2 | Pending | — |
| 3-25 | Pending | — |
| 26-33 | Pending | — |
| 34 (Final) | Pending | — |

---

## PR Breakdown

### Phase 1 (PRs 2-25): Add params to ReportUtils functions + direct callers

Each PR adds optional params with fallback to the module-level variable. Component callers pass real values. Action file callers pass `undefined + TODO` (fallback preserves behavior).

---

**PR 1: `canModifyHoldStatus` + `canHoldUnholdReportAction` + `isAdminOwnerApproverOrReportOwner` + `isNonOwnerMangerOfIOUReport`** — Status: **Merged**

See completed tree in PR 1 section of previous plan revision.

---

**PR 2: `isOptimisticPersonalDetail` + `isTestTransactionReport`** (~30-35 lines) — Status: **Pending**

```
ReportUtils.ts — add personalDetailsList? param:
├── isOptimisticPersonalDetail (L1839) — fallback to allPersonalDetails
├── shouldDisableDetailPage (L2207) — forward to isOptimisticPersonalDetail
├── isTestTransactionReport (L12816) — fallback to allPersonalDetails
└── buildOptimisticReportPreview (L7556) — forward to isTestTransactionReport

Component callers — pass from useOnyx(PERSONAL_DETAILS_LIST):
├── ReportActionItemCreated.tsx L44 (ReportActionItemCreated) — add useOnyx, pass to shouldDisableDetailPage
├── HeaderView.tsx L226 (HeaderView) — already has useOnyx ✅, pass to shouldDisableDetailPage
├── UserDetailsRenderer.tsx L23 (UserDetailsRenderer) — add useOnyx, pass to isOptimisticPersonalDetail
└── ReportActionItemSingle.tsx L141 (ReportActionItemSingle) — already has useOnyx ✅, pass to isOptimisticPersonalDetail

Action callers — undefined + TODO:
├── IOU/index.ts L4025/4029/4209 (createSplitsAndOnyxData) — undefined → PR 26; `isOptimisticPersonalDetail` falls back to module-level `allPersonalDetails`
├── IOU/index.ts L8203 (getSearchOnyxUpdate) — undefined → PR 26; `isOptimisticPersonalDetail` falls back to module-level `allPersonalDetails`
├── IOU/index.ts L1702 (buildOnyxDataForMoneyRequest) — undefined → PR 26; `isTestTransactionReport` falls back to module-level `allPersonalDetails`
└── Policy/Member.ts L126 (buildRoomMembersOnyxData) — undefined → PR 32; `isOptimisticPersonalDetail` falls back to module-level `allPersonalDetails`
```

---

**PR 3: `hasExpensifyGuidesEmails` chain + `isJoinRequestInAdminRoom` chain** (~40-45 lines)

```
ReportUtils.ts — add personalDetailsList? param:
├── hasExpensifyGuidesEmails (L2261) — fallback to allPersonalDetails
├── findLastAccessedReport (L2279) — forward to hasExpensifyGuidesEmails
├── canSeeDefaultRoom (L9063) — forward to hasExpensifyGuidesEmails
├── canAccessReport (L9083) — forward to canSeeDefaultRoom
└── canCurrentUserOpenReport (L10727) — forward to canAccessReport

ReportUtils.ts — add currentUserLogin? param:
├── isJoinRequestInAdminRoom (L2423) — fallback to currentUserPersonalDetails?.login
├── getReasonAndReportActionThatRequiresAttention (L4259) — forward to isJoinRequestInAdminRoom
└── generateReportAttributes (L12849) — forward to getReasonAndReportActionThatRequiresAttention

Component callers — pass from useOnyx(PERSONAL_DETAILS_LIST):
├── ReportsSplitNavigator.tsx L54 (ReportsSplitNavigator) — add useOnyx, pass pdl to findLastAccessedReport
├── ReportRouteParamHandler.tsx L38 (ReportRouteParamHandler) — add useOnyx, pass pdl to findLastAccessedReport
├── withReportOrNotFound.tsx L100 (WithReportOrNotFound) — add useOnyx, pass pdl to canAccessReport
├── withReportAndReportActionOrNotFound.tsx L79 (WithReportOrNotFound) — add useOnyx, pass pdl to canAccessReport
└── ReportActionItemParentAction.tsx L236 (ReportActionItemParentAction) — add useOnyx, pass pdl to canCurrentUserOpenReport

Component callers — pass currentUserLogin:
└── useOptimisticNextStep.ts L78 (useOptimisticNextStep) — add useCurrentUserPersonalDetails, pass login to getReasonAndReportActionThatRequiresAttention

Lib callers — forward existing param:
├── SidebarUtils.ts L1210 (getOptionData) — forward login from personalDetails param ✅
└── reportAttributes.ts L262 (compute) — pass session?.login (session already a dependency)

Action/lib callers — undefined + TODO:
├── navigateAfterOnboarding.ts L33 (getReportIDAfterOnboarding) → PR 33; `hasExpensifyGuidesEmails` falls back to module-level `allPersonalDetails`
├── Link.ts L340 (navigateHandler) → PR 33; `hasExpensifyGuidesEmails` falls back to module-level `allPersonalDetails`
├── Report/index.ts L4294 (navigateToMostRecentReport) → PR 30; `hasExpensifyGuidesEmails` falls back to module-level `allPersonalDetails`
├── Report/index.ts L4320 (getMostRecentReportID) → PR 30; `hasExpensifyGuidesEmails` falls back to module-level `allPersonalDetails`
└── DebugUtils.ts L1465 (getReasonAndReportActionForGBRInLHNRow) → PR 33; `isJoinRequestInAdminRoom` falls back to module-level `currentUserPersonalDetails?.login`
```

---

**PR 4: `getChatRoomSubtitle` + `getParentNavigationSubtitle`** (~30-35 lines)

```
ReportUtils.ts — add personalDetailsList? param:
├── getChatRoomSubtitle (L6074) — fallback to allPersonalDetails
└── getParentNavigationSubtitle (L6127) — fallback to allPersonalDetails

Component callers — pass from useOnyx(PERSONAL_DETAILS_LIST):
├── AvatarWithDisplayName.tsx L202/203 (AvatarWithDisplayName) — add useOnyx, pass to both
├── HeaderView.tsx L150/157 (HeaderView) — already has useOnyx ✅, pass to both
├── ShareCodePage.tsx L100 (ShareCodePage) — add useOnyx, pass to both
├── ReportDetailsPage.tsx L230/235 (ReportDetailsPage) — already has useOnyx ✅, pass to both
└── ExpenseReportListItemRow.tsx L243 (ExpenseReportListItemRow) — add useOnyx, pass to getParentNavigationSubtitle

Lib callers — forward existing param:
├── SidebarUtils.ts L825 (getOptionData) — forward from personalDetails param ✅
├── OptionsListUtils.ts L1079 (createOption) — forward from personalDetails param ✅
└── Task.ts L1126 (getShareDestination) — forward from personalDetails param ✅
```

---

**PR 5: `getParticipantsAccountIDsForDisplay` + internal forwarding — component callers** (~35-40 lines)

```
ReportUtils.ts — add personalDetailsList? param:
├── getParticipantsAccountIDsForDisplay (L3493) — fallback to allPersonalDetails
├── getParticipantsList (L3536) — forward to getParticipantsAccountIDsForDisplay
├── navigateToDetailsPage (L6189) — forward to getParticipantsAccountIDsForDisplay
├── goBackToDetailsPage (L6207) — forward to getParticipantsAccountIDsForDisplay
└── goBackFromPrivateNotes (L6247) — forward to getParticipantsAccountIDsForDisplay

Component callers — pass from useOnyx(PERSONAL_DETAILS_LIST):
├── ReportWelcomeText.tsx L64/110 (ReportWelcomeText) — add useOnyx, pass to getParticipantsAccountIDsForDisplay
├── HeaderView.tsx L129/307 (HeaderView) — already has useOnyx ✅, pass to getParticipantsAccountIDsForDisplay + navigateToDetailsPage
├── AccountManagerBanner.tsx L33 (AccountManagerBanner) — add useOnyx, pass to getParticipantsAccountIDsForDisplay
├── ShareCodePage.tsx L95 (ShareCodePage) — already has useOnyx from PR 4 ✅, pass
├── ReportDetailsPage.tsx L250/577 (ReportDetailsPage) — already has useOnyx ✅, pass to getParticipantsList + getParticipantsAccountIDsForDisplay
├── InviteReportParticipantsPage.tsx L51 (InviteReportParticipantsPage) — add useOnyx, pass
├── RoomInvitePage.tsx L114 (RoomInvitePage) — add useOnyx, pass
├── DebugReportActions.tsx L58 (DebugReportActions) — add useOnyx, pass
├── AvatarWithDisplayName.tsx L223 (AvatarWithDisplayName) — already has useOnyx from PR 4 ✅, pass to navigateToDetailsPage
├── MoneyReportHeader.tsx L1292 (MoneyReportHeader) — add useOnyx, pass to navigateToDetailsPage
├── MoneyRequestHeaderSecondaryActions.tsx L397 (MoneyRequestHeaderSecondaryActions) — add useOnyx, pass to navigateToDetailsPage
├── ReportActionItemCreated.tsx L60 (ReportActionItemCreated) — already has useOnyx from PR 2 ✅, pass to navigateToDetailsPage
├── PrivateNotesEditPage.tsx L107/131 (PrivateNotesEditPage) — add useOnyx, pass to goBackToDetailsPage + goBackFromPrivateNotes
└── PrivateNotesListPage.tsx L95 (PrivateNotesListPage) — add useOnyx, pass to goBackToDetailsPage
```

---

**PR 6: `getParticipantsAccountIDsForDisplay` — lib/action callers** (~25-30 lines)

```
Lib callers — forward existing param:
├── OptionsListUtils.ts L1167 (getReportOption) — forward from personalDetails param ✅
├── OptionsListUtils.ts L1230 (getReportDisplayOption) — forward from personalDetails param ✅
├── OptionsListUtils.ts L1422 (processReport) — forward from personalDetails param ✅
├── OptionsListUtils.ts L1575 (createFilteredOptionList) — forward from personalDetails param ✅
├── OptionsListUtils.ts L1655 (createOptionFromReport) — forward from personalDetails param ✅
├── SidebarUtils.ts L765 (getOptionData) — forward from personalDetails param ✅
└── Task.ts L1108 (getShareDestination) — forward from personalDetails param ✅

Lib callers — undefined + TODO:
└── OptionsListUtils.ts L2173 (isValidReport) — undefined → PR 33; `getParticipantsAccountIDsForDisplay` falls back to module-level `allPersonalDetails`
```

---

**PR 7: `getPersonalDetailsForAccountID` — update callers that omit the param** (~25-30 lines)

Function already has optional `personalDetailsData?` param — no signature change needed. This PR updates callers that currently OMIT the param.

```
getPersonalDetailsForAccountID (L3368) — already has optional personalDetailsData?

Internal caller — forward:
└── buildOptimisticIOUReport (L6621) — add param, forward to getPersonalDetailsForAccountID

Component callers — already pass the param ✅:
├── IOURequestStepReport.tsx L76 (IOURequestStepReport) ✅
├── IOURequestEditReport.tsx L53 (IOURequestEditReport) ✅
└── SearchTransactionsChangeReport.tsx L95 (SearchTransactionsChangeReport) ✅

Action/lib callers — undefined + TODO:
├── IOU/index.ts L4706 (prepareToCleanUpMoneyRequest) → PR 27; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
├── IOU/SendInvoice.ts L599 (getSendInvoiceInformation) → PR 29; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
├── Policy/Member.ts L248 (resetAccountingPreferredExporter) → PR 32; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
├── NextStepUtils.ts L304 (getNextApproverDisplayName) → PR 33; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
├── NextStepUtils.ts L481 (buildNextStepNew) → PR 33; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
├── SearchUIUtils.ts L1160 (getTransactionItemCommonFormattedProperties) → PR 33; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
├── SearchUIUtils.ts L1601 (getIOUReportName) → PR 33; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
└── SearchUIUtils.ts L2404 (getReportSections) → PR 33; `getPersonalDetailsForAccountID` falls back to module-level `allPersonalDetails`
```

---

**PR 8: `getDisplayNameForParticipant` — component callers** (~30-35 lines)

Function already has optional `personalDetailsData` param — no signature change needed. This PR updates component callers that currently OMIT it.

```
getDisplayNameForParticipant (L3396) — already has optional personalDetailsData?

Component callers already passing param ✅:
├── ReportAddApproverPage.tsx L72 ✅
├── SearchAddApproverPage.tsx L103 ✅
├── SearchFiltersParticipantsSelector.tsx L129 ✅
└── useReportActionAvatars.ts L209 ✅

Component callers — add useOnyx(PERSONAL_DETAILS_LIST), pass:
├── QuickActionMenuItem.tsx L88 (QuickActionMenuItem) — add useOnyx, pass
├── MoneyRequestReportPreviewContent.tsx L217/232 (MoneyRequestReportPreviewContent) — add useOnyx, pass
├── WorkspaceMembersPage.tsx L173/174/184/185 (WorkspaceMembersPage) — has personalDetails prop ✅, pass
├── ReportTypingIndicator.tsx L34 (ReportTypingIndicator) — add useOnyx, pass
├── ShareCodePage.tsx L96 (ShareCodePage) — already has useOnyx from PR 4 ✅, pass
├── TaskView.tsx L206 (TaskView) — add useOnyx, pass
└── UserSelectionListItem.tsx L64 (UserSelectionListItem) — add useOnyx, pass
```

---

**PR 9: `getDisplayNameForParticipant` — ReportNameUtils callers** (~30-35 lines)

```
ReportNameUtils.ts — add personalDetailsList? param:
├── getGroupChatName L275/285 — add param, forward to getDisplayNameForParticipant
├── getPolicyExpenseChatName L296 — already has personalDetailsList ✅, forward
├── getMoneyRequestReportName L388/404 — add param, forward to getDisplayNameForParticipant
├── buildReportNameFromParticipantNames L212/223 — already passes personalDetailsList ✅
└── computeReportName L989 — already passes personalDetailsList ✅

Callers of getGroupChatName:
├── NewChatConfirmPage.tsx — add useOnyx, pass
├── GroupChatNameEditPage.tsx — add useOnyx, pass
├── InviteReportParticipantsPage.tsx — add useOnyx, pass
└── computeReportName L949 — forward (already has param from above)

Callers of getMoneyRequestReportName:
└── computeReportName, getReportName — forward (already has param)
```

---

**PR 10: `getDisplayNameForParticipant` — other lib callers** (~30-35 lines)

```
Lib callers — add personalDetailsList? param, forward to getDisplayNameForParticipant:
├── SidebarUtils.ts L1291 (getWelcomeMessage) — already has personalDetails ✅, forward
├── SidebarUtils.ts L1364 (getRoomWelcomeMessage) — already has personalDetails ✅, forward
├── PersonalDetailOptionsListUtils.ts L68 (createOption) — add param
├── SuggestionUtils.ts L28 (getDisplayName) — add param
├── OptionsListUtils.ts L1115 (createSearchOption) — add param, forward
├── NextStepUtils.ts L49 (buildNextStepMessage) — add param
├── NextStepUtils.ts L304 (getNextApproverDisplayName) — add param
└── NextStepUtils.ts L475/479/481/787 (buildNextStepNew) — add param

NextStepUtils action callers — undefined + TODO:
└── All IOU, Report, Transaction, Policy, Hold, PerDiem callers of buildNextStepNew → PRs 26-32; `getDisplayNameForParticipant` falls back to module-level `allPersonalDetails` (default param)
```

---

**PR 11: `getDisplayNameForParticipant` — internal ReportUtils callers batch 1** (~30-35 lines)

```
ReportUtils.ts — add personalDetailsList? param, forward to getDisplayNameForParticipant:
├── getDisplayNamesWithTooltips (L3958) — already has personalDetailsList param ✅ (no change needed, just verify forwarding)
├── getUserDetailTooltipText (L4009) — add param
├── getReimbursementDeQueuedOrCanceledActionMessage (L4070) — add param
├── getPayeeName (L6029) — add param
└── getWhisperDisplayNames (L10143) — add param

External callers of getUserDetailTooltipText:
├── AttendeesCell.tsx L53 (AttendeesCell) — add useOnyx, pass
├── ReportActionAvatar.tsx L363/478 (ReportActionAvatarMultipleHorizontal/Diagonal) — add useOnyx, pass
└── BaseUserDetailsTooltip.tsx L24/34 (BaseUserDetailsTooltip) — add useOnyx, pass

External callers of getReimbursementDeQueuedOrCanceledActionMessage:
├── ReportNameUtils.ts L479 (computeReportNameBasedOnReportAction) — add param, forward
├── ContextMenuActions.tsx L842 (copyMessage onPress) — add useOnyx, pass
├── ReportActionItem.tsx L179 (ReportActionItem) — add useOnyx, pass
└── OptionsListUtils.ts L739 (getLastMessageTextForReport) — forward from personalDetails ✅

External callers of getPayeeName:
├── IOURequestStartPage.tsx L112/113 (IOURequestStartPage) — add useOnyx, pass
├── DistanceRequestStartPage.tsx L73/74 (DistanceRequestStartPage) — add useOnyx, pass
└── AttachmentPickerWithMenuItems.tsx L253 (AttachmentPickerWithMenuItems) — add useOnyx, pass

External callers of getWhisperDisplayNames:
└── PureReportActionItem.tsx L2191 (PureReportActionItem) — add useOnyx, pass
```

---

**PR 12: `getDisplayNameForParticipant` — internal ReportUtils callers batch 2** (~30-35 lines)

```
ReportUtils.ts — add personalDetailsList? param, forward to getDisplayNameForParticipant:
├── getReportPreviewMessage (L5349, 5 internal call sites at L5453/5514/5537/5567/5578) — add param
├── getParentNavigationSubtitle (L6127) — already has from PR 4, forward to getDisplayNameForParticipant
├── buildOptimisticIOUReportAction (L7125) — add param
├── buildOptimisticChangedTaskAssigneeReportAction (L8308) — add param
└── buildOptimisticChangeApproverReportAction (L8449) — add param

External callers of getReportPreviewMessage:
├── OptionsListUtils.ts L699/724 (getLastMessageTextForReport) — forward from personalDetails ✅
├── ContextMenuActions.tsx L822 (copyMessage onPress) — add useOnyx, pass
├── Report/index.ts L3502 (buildNewReportOptimisticData) — undefined + TODO → PR 30; `getDisplayNameForParticipant` falls back to module-level `allPersonalDetails` (default param)
└── Policy/Policy.ts L4319 (createWorkspaceFromIOUPayment) — undefined + TODO → PR 32; `getDisplayNameForParticipant` falls back to module-level `allPersonalDetails` (default param)

External callers of buildOptimisticIOUReportAction:
├── IOU/index.ts L1588/1898/3805/5948 (buildOnyxDataForTestDriveIOU, buildOnyxDataForMoneyRequest, createSplitsAndOnyxData, getPayMoneyRequestParams) → PR 26/28; `getDisplayNameForParticipant` falls back to module-level `allPersonalDetails` (default param)
├── IOU/Split.ts L423 (startSplitBill) → PR 29; same fallback
├── Search.ts L1657 (setOptimisticDataForTransactionThreadPreview) → PR 33; same fallback
├── Report/index.ts L1417 (openReport) → PR 30; same fallback
├── MergeTransaction.ts L598 (mergeTransactionRequest) → PR 31; same fallback
└── ReportActionsView.tsx L216 (ReportActionsView) — add useOnyx, pass

External callers of buildOptimisticChangedTaskAssigneeReportAction:
└── Task.ts L757 (editTaskAssignee) — undefined + TODO → PR 31; `getDisplayNameForParticipant` falls back to module-level `allPersonalDetails` (default param)

External callers of buildOptimisticChangeApproverReportAction:
├── IOU/index.ts L9198 (assignReportToMe) → PR 28; `getDisplayNameForParticipant` falls back to module-level `allPersonalDetails` (default param)
└── IOU/index.ts L9314 (addReportApprover) → PR 28; same fallback
```

---

**PR 13: `getTransactionDetails` — component callers batch 1** (~30-35 lines)

Function already has optional `currentUserDetails` param — no signature change needed.

```
getTransactionDetails (L4634) — already has optional currentUserDetails?

Component caller already passing ✅:
└── MoneyRequestView.tsx L275 ✅

Component callers — add useCurrentUserPersonalDetails, pass:
├── useEReceipt.tsx L30 (useEReceipt) — add useCurrentUserPersonalDetails, pass
├── TransactionPreviewContent.tsx L79 (TransactionPreviewContent) — add useCurrentUserPersonalDetails, pass
├── IOURequestStepTaxAmountPage.tsx L79 (IOURequestStepTaxAmountPage) — add useCurrentUserPersonalDetails, pass
├── SplitExpensePage.tsx L129 (SplitExpensePage) — add useCurrentUserPersonalDetails, pass
├── TransactionPreview/index.tsx L72 (TransactionPreview) — add useCurrentUserPersonalDetails, pass
├── PerDiemEReceipt.tsx L63 (PerDiemEReceipt) — add useCurrentUserPersonalDetails, pass
├── DistanceEReceipt.tsx L35 (DistanceEReceipt) — add useCurrentUserPersonalDetails, pass
└── TotalCell.tsx L15 (TotalCell) — add useCurrentUserPersonalDetails, pass
```

---

**PR 14: `getTransactionDetails` — component callers batch 2 + internal forwarding** (~30-35 lines)

```
Component callers — add useCurrentUserPersonalDetails, pass:
├── SplitExpenseEditPage.tsx L61 (SplitExpenseEditPage) — add hook, pass
├── IOURequestStepMerchant.tsx L62 (IOURequestStepMerchant) — add hook, pass
├── IOURequestStepAmount.tsx L119/120/391 (IOURequestStepAmount) — already has hook ✅, pass
├── AddUnreportedExpense.tsx L97 (AddUnreportedExpense) — add hook, pass
├── DetailsReviewPage.tsx L88 (DetailsReviewPage) — add hook, pass
├── IOURequestStepCategory.tsx L82 (IOURequestStepCategory) — add hook, pass
└── EReceipt.tsx L97 (EReceipt) — add hook, pass

Internal forwarding — add param, forward to getTransactionDetails:
├── getBillableAndTaxTotal (L4422) — add currentUserPersonalDetails? param
│   ├── MoneyRequestReportTransactionList.tsx L154 — add hook, pass
│   └── MoneyReportView.tsx L93 — add hook, pass
└── createDraftTransactionAndNavigateToParticipantSelector (L11364) — add currentUserPersonalDetails? param
    ├── PureReportActionItem.tsx L966/990/1008 — add hook, pass
    └── ReportDetailsPage.tsx L459/483/504 — already has hook ✅, pass
```

---

**PR 15: `getTransactionDetails` — action/lib callers** (~40-50 lines)

```
Action/lib callers — add currentUserPersonalDetails? param, forward to getTransactionDetails:
├── SplitExpenses.ts L57/86 (initSplitExpense) — add param
├── IOU/Duplicate.ts L690 (duplicateExpenseTransaction) — already has personalDetails ✅, forward
├── IOU/Duplicate.ts L871 (duplicateReport) — already has personalDetails ✅, forward
├── Transaction.ts L1166 (changeTransactionsReport) — add param
├── MergeTransactionUtils.ts L223/224/497/624 (getMergeableDataAndConflictFields, getDisplayValue, getMergeFieldUpdatedValues) — add param
├── MergeTransaction.ts L240 (getOnyxTargetTransactionData) — add param
├── IOU/Split.ts L1033 (completeSplitBill) — add param
├── IOU/Split.ts L1088/1410 (updateSplitTransactions) — already has personalDetails ✅, forward
├── IOU/Split.ts L2481 (initSplitExpenseItemData) — add param
├── IOU/Split.ts L2514 (initDraftSplitExpenseDataForEdit) — add param
├── IOU/Split.ts L2753 (resetSplitExpensesByDateRange) — add param
├── IOU/Split.ts L2841 (updateSplitExpenseField) — add param
├── IOU/index.ts L3017 (getUpdateMoneyRequestParams) — add param
├── IOU/index.ts L3535 (getUpdateTrackExpenseParams) — add param
├── IOU/index.ts L9426 (removeUnchangedBulkEditFields) — add param
└── ReportSecondaryActionUtils.ts L120 (isSplitAction) — add param

These action callers pass undefined + TODO for currentUserPersonalDetails;
they'll get real values threaded in Phase 2 PRs 26-31.
Fallback: `getTransactionDetails` falls back to module-level `currentUserPersonalDetails` (default param `currentUserDetails = currentUserPersonalDetails`).
```

---

**PR 16: `getParsedComment` — add param + internal wrappers + component callers** (~30-35 lines)

```
ReportUtils.ts — add personalDetailsList? param (derives allPersonalDetailLogins inline):
├── getParsedComment (L6304) — fallback to allPersonalDetails, derive logins inline
├── getCommentLength (L9802) — add param, forward to getParsedComment
├── buildOptimisticEditedTaskFieldReportAction (L8240) — add param, forward to getParsedComment
├── buildOptimisticTaskReport (L8665) — add param, forward to getParsedComment (2 calls at L8688/8689)
└── buildOptimisticRejectReportActionComment (L13017) — add param, forward to getParsedComment

Component callers — add useOnyx(PERSONAL_DETAILS_LIST), pass:
├── WorkspaceNewRoomPage.tsx L123/204 (submit, validate) — add useOnyx, pass to getParsedComment + getCommentLength
├── SplitExpenseEditPage.tsx L102 (SplitExpenseEditPage) — add useOnyx, pass
└── TaskTitlePage.tsx L48/49 (validate) — add useOnyx, pass to getParsedComment + getCommentLength

Other getCommentLength component callers:
├── NewTaskDetailsPage.tsx L61 (validate) — add useOnyx, pass
├── TaskDescriptionPage.tsx L47 (validate) — add useOnyx, pass
├── NewTaskDescriptionPage.tsx L47 (validate) — add useOnyx, pass
├── NewTaskTitlePage.tsx L42 (validate) — add useOnyx, pass
└── useHandleExceedMaxCommentLength.ts L10 (validateCommentMaxLength) — add useOnyx, pass
```

---

**PR 17: `getParsedComment` — action callers batch 1** (~30-35 lines)

```
Action callers — add personalDetailsList? param, forward to getParsedComment:
├── Task.ts L645/649 (editTask) — add param
│   └── TaskDescriptionPage.tsx, TaskTitlePage.tsx — pass from useOnyx
├── Report/index.ts L705 (addActions) — add param
│   └── addComment → ReportActionCompose.tsx, ShareDetailsPage.tsx — pass from useOnyx
├── Report/index.ts L3331 (updateDescription) — add param
│   └── RoomDescriptionPage.tsx — pass from useOnyx
├── Policy/Policy.ts L1983 (updateWorkspaceDescription) — add param
│   └── WorkspaceOverviewDescriptionPage.tsx — pass from useOnyx
├── Policy/Policy.ts L5795 (updateCustomRules) — add param
│   └── RulesCustomPage.tsx — pass from useOnyx
├── Search.ts L1183 (rejectMoneyRequestInBulk) — add param
├── SendMoney.ts L92 (getSendMoneyParams) — add param
└── IOU/SendInvoice.ts L739 (sendInvoice) — add param
```

---

**PR 18: `getParsedComment` — action callers batch 2** (~30-35 lines)

```
Action callers — add personalDetailsList? param, forward to getParsedComment:
├── IOU/TrackExpense.ts L1577 (requestMoney) — add param
├── IOU/TrackExpense.ts L1940 (convertBulkTrackedExpensesToIOU) — add param
├── IOU/TrackExpense.ts L2253 (trackExpense) — add param
├── IOU/Split.ts L209 (splitBill) — add param
├── IOU/Split.ts L304 (splitBillAndOpenReport) — add param
├── IOU/Split.ts L398 (startSplitBill) — add param
├── IOU/Split.ts L771 (completeSplitBill) — add param
├── IOU/Split.ts L1143 (updateSplitTransactions .map callback) — add param
├── IOU/Split.ts L1366 (updateSplitTransactions) — add param
├── IOU/index.ts L4285 (createDistanceRequest) — add param
├── IOU/index.ts L8404 (prepareRejectMoneyRequestData) — add param
├── IOU/index.ts L9573 (updateMultipleMoneyRequests) — add param
└── IOU/UpdateMoneyRequest.ts L621 (updateMoneyRequestDescription) — add param

Component callers for these action functions:
└── IOURequestStepConfirmation.tsx, SplitBillDetailsPage.tsx, SplitExpensePage.tsx, etc. — pass from useOnyx
```

---

**PR 19: `buildOptimisticAddCommentReportAction`** (~30-35 lines)

```
ReportUtils.ts — add personalDetailsList? param:
├── buildOptimisticAddCommentReportAction (L6386) — forward to getParsedComment (from PR 16)
└── buildOptimisticTaskCommentReportAction (L6527) — forward to buildOptimisticAddCommentReportAction

External callers:
├── Report/index.ts L689/698 (addActions) — already has pdl from PR 17 ✅, forward
├── IOU/Split.ts L1484 (addCommentToSplitTransactionThread in updateSplitTransactions) — already has pdl from PR 18 ✅, forward
├── IOU/index.ts L1601 (buildOnyxDataForTestDriveIOU) — undefined + TODO → PR 26; `getParsedComment` falls back to module-level `allPersonalDetails` (derives logins inline)
├── User.ts L1554 (respondToProactiveAppReview) — undefined + TODO → PR 32; `getParsedComment` falls back to module-level `allPersonalDetails`
├── BankAccounts.ts L1631 (pressLockedBankAccount) — undefined + TODO → PR 32; `getParsedComment` falls back to module-level `allPersonalDetails`
├── SuggestedFollowup.ts L84 (resolveSuggestedFollowup) — undefined + TODO → PR 32; `getParsedComment` falls back to module-level `allPersonalDetails`
└── Task.ts L140 (createTaskAndNavigate) — undefined + TODO → PR 31; `getParsedComment` falls back to module-level `allPersonalDetails`
```

---

**PR 20: `getCurrentUserAvatar`/`getCurrentUserDisplayNameOrEmail` + buildOptimistic batch 1** (~35-40 lines)

```
ReportUtils.ts — add currentUserPersonalDetails? param:
├── getCurrentUserAvatar (L1271) — fallback to module currentUserPersonalDetails
├── getCurrentUserDisplayNameOrEmail (L1275) — fallback to module currentUserPersonalDetails

Batch 1 builders — add currentUserPersonalDetails? param (calls getCurrentUserAvatar/DisplayNameOrEmail):
All action callers below pass undefined until their Phase 2 PR; `getCurrentUserAvatar`/`getCurrentUserDisplayNameOrEmail` fall back to module-level `currentUserPersonalDetails`.
├── buildOptimisticChangeFieldAction (L4090) — caller: Report/index.ts L3124 (updateReportField) → PR 30
├── buildOptimisticCancelPaymentReportAction (L4140) — caller: IOU/index.ts L7612 (cancelPayment) → PR 28
├── buildOptimisticIOUReportAction (L7125) — callers: IOU/index.ts L1588/1898/3805/5948, Split.ts L423, Search.ts L1657, Report/index.ts L1417, MergeTransaction.ts L598 → PRs 26-31
├── buildOptimisticApprovedReportAction (L7245) — caller: IOU/index.ts L6453 (approveMoneyRequest) → PR 28
├── buildOptimisticUnapprovedReportAction (L7279) — caller: IOU/index.ts L7170 (unapproveExpenseReport) → PR 28
├── buildOptimisticMovedReportAction (L7347) — callers: Policy/Policy.ts L4334/4336, Report/index.ts L6368/6409 → PRs 30/32
├── buildOptimisticChangePolicyReportAction (L7398) — caller: Report/index.ts L6853 (buildOptimisticChangePolicyData) → PR 30
├── buildOptimisticTransactionAction (L7447) — internal only (called by MovedTransactionAction, UnreportedTransactionAction)
│   ├── buildOptimisticMovedTransactionAction (L7490) — callers: IOU/index.ts L8694, Transaction.ts L1373, TrackExpense.ts L1199 → PRs 28/31/29
│   └── buildOptimisticUnreportedTransactionAction (L7498) — callers: Transaction.ts L1372, Report/index.ts L5906 → PRs 30/31
└── buildOptimisticSubmittedReportAction (L7506) — caller: IOU/index.ts L7346 (submitReport) → PR 28
```

---

**PR 21: buildOptimistic batch 2** (~35-40 lines)

```
ReportUtils.ts — add currentUserPersonalDetails? param:
All action callers below pass undefined until their Phase 2 PR; `getCurrentUserAvatar`/`getCurrentUserDisplayNameOrEmail` fall back to module-level `currentUserPersonalDetails`.
├── buildOptimisticCreatedReportAction (L7954) — callers:
│   ├── IOU/index.ts L3804/9808 (createSplitsAndOnyxData, updateMultipleMoneyRequests) → PR 26/28
│   ├── IOU/Hold.ts L63 (putOnHold) → PR 31
│   ├── TrackExpense.ts L878 (getTrackExpenseInformation) → PR 29
│   ├── Transaction.ts L920/1314 (changeTransactionsReport) → PR 31
│   ├── Task.ts L139 (createTaskAndNavigate) → PR 31
│   ├── IOU/Split.ts L422 (startSplitBill) → PR 29
│   ├── IOU/Duplicate.ts L282 (mergeDuplicates) → PR 29
│   ├── TeachersUnite.ts L93 (addSchoolPrincipal) → PR 32
│   ├── IOU/PerDiem.ts L600 (getPerDiemExpenseInformationForSelfDM) → PR 29
│   ├── Policy/Policy.ts L1620 (createPolicyExpenseChats) → PR 32
│   ├── Report/index.ts L1529/1767/3753/5699 (openReport, createGroupChat, addPolicyReport, deleteAppReport) → PR 30
│   └── ReportActionsView.tsx L195 — add useCurrentUserPersonalDetails, pass
├── buildOptimisticRenamedRoomReportAction (L7989) — caller: Report/index.ts L3958 (updatePolicyRoomName) → PR 30
├── buildOptimisticRoomDescriptionUpdatedReportAction (L8031) — caller: Report/index.ts L3332 (updateDescription) → PR 30
├── buildOptimisticRoomAvatarUpdatedReportAction (L8063) — caller: Report/index.ts L1101 (updatePolicyRoomAvatar) → PR 30
├── buildOptimisticHoldReportAction (L8096) — callers: IOU/Duplicate.ts L436, IOU/Hold.ts L44 → PRs 29/31
├── buildOptimisticHoldReportActionComment (L8127) — caller: IOU/Hold.ts L45 → PR 31
├── buildOptimisticUnHoldReportAction (L8158) — callers: Transaction.ts L1418, IOU/Hold.ts L342, Report/index.ts L5821 → PRs 30/31
├── buildOptimisticRetractedReportAction (L8185) — caller: IOU/index.ts L6996 (retractReport) → PR 28
├── buildOptimisticReopenedReportAction (L8213) — caller: IOU/index.ts L6812 (reopenReport) → PR 28
└── buildOptimisticEditedTaskFieldReportAction (L8240) — add AFTER delegateEmailParam — caller: Task.ts L641 (editTask) → PR 31
```

---

**PR 22: buildOptimistic batch 3** (~30-35 lines)

```
ReportUtils.ts — add currentUserPersonalDetails? param:
All action callers below pass undefined until their Phase 2 PR; `getCurrentUserAvatar`/`getCurrentUserDisplayNameOrEmail` fall back to module-level `currentUserPersonalDetails`.
├── buildOptimisticCardAssignedReportAction (L8287) — caller: CompanyCards.ts L421 (assignWorkspaceCompanyCard) → PR 32
├── buildOptimisticChangedTaskAssigneeReportAction (L8308) — add AFTER delegateEmailParam — caller: Task.ts L757 (editTaskAssignee) → PR 31
├── buildOptimisticClosedReportAction (L8343) — caller: Policy/Policy.ts L543 (buildPolicyData) → PR 32
├── buildOptimisticDismissedViolationReportAction (L8388) — callers: IOU/Duplicate.ts L476, Transaction.ts L515/751 → PRs 29/31
├── buildOptimisticResolvedDuplicatesReportAction (L8423) — caller: IOU/Duplicate.ts L232 (mergeDuplicates) → PR 29
├── buildOptimisticChangeApproverReportAction (L8449) — callers: IOU/index.ts L9198/9314 (assignReportToMe, addReportApprover) → PR 28
├── buildOptimisticExportIntegrationAction (L8712) — callers: Search.ts L768, Report/index.ts L5442/5504 → PRs 30/33
├── buildOptimisticRejectReportAction (L12986) — caller: IOU/index.ts L8403 (prepareRejectMoneyRequestData) → PR 28
├── buildOptimisticRejectReportActionComment (L13017) — caller: IOU/index.ts L8405 (prepareRejectMoneyRequestData) → PR 28
└── buildOptimisticMarkedAsResolvedReportAction (L13121) — caller: IOU/index.ts L9126 (markRejectViolationAsResolved) → PR 28
```

---

**PR 23: `buildOptimisticModifiedExpenseReportAction` + `buildOptimisticDetachReceipt` + `buildOptimisticTaskReportAction`** (~30-35 lines)

These read `currentUserPersonalDetails?.displayName` directly (not via helpers).

```
ReportUtils.ts — add currentUserPersonalDetails? param:
├── getModifiedExpenseOriginalMessage (L5591) — fallback to module currentUserPersonalDetails
├── buildOptimisticModifiedExpenseReportAction (L7647) — forward to getModifiedExpenseOriginalMessage
├── buildOptimisticDetachReceipt (L7693) — fallback to module currentUserPersonalDetails
└── buildOptimisticTaskReportAction (L7788) — fallback to module currentUserPersonalDetails

External callers of buildOptimisticModifiedExpenseReportAction:
All pass undefined until Phase 2; `getModifiedExpenseOriginalMessage` falls back to module-level `currentUserPersonalDetails`.
├── IOU/index.ts L3072 (getUpdateMoneyRequestParams) → PR 27
├── IOU/index.ts L3581 (getUpdateTrackExpenseParams) → PR 27
└── IOU/index.ts L9751 (updateMultipleMoneyRequests) → PR 28

External callers of buildOptimisticDetachReceipt:
Passes undefined until Phase 2; `buildOptimisticDetachReceipt` falls back to module-level `currentUserPersonalDetails`.
└── IOU/Receipt.ts L117 (detachReceipt) → PR 31

External callers of buildOptimisticTaskReportAction:
All pass undefined until Phase 2; `buildOptimisticTaskReportAction` falls back to module-level `currentUserPersonalDetails`.
├── Task.ts L396 (buildTaskData) → PR 31
├── Task.ts L537 (reopenTask) → PR 31
└── Task.ts L1182 (deleteTask) → PR 31

Internal caller:
└── prepareOnboardingOnyxData L11901 — handled in PR 24
```

---

**PR 24: `getTaskAssigneeChatOnyxData` + `prepareOnboardingOnyxData`** (~30-35 lines)

```
ReportUtils.ts — add personalDetailsList? + currentUserPersonalDetails? params:
├── getTaskAssigneeChatOnyxData (L10413) — forward to isOptimisticPersonalDetail, buildOptimisticTaskCommentReportAction, buildOptimisticCreatedReportAction
└── prepareOnboardingOnyxData (L11700) — forward to buildOptimisticAddCommentReportAction, buildOptimisticTaskReport, buildOptimisticTaskReportAction, buildOptimisticCreatedReportAction, buildOptimisticTaskCommentReportAction

External callers of getTaskAssigneeChatOnyxData:
All pass undefined until Phase 2; `isOptimisticPersonalDetail` falls back to module-level `allPersonalDetails`, `getCurrentUserAvatar`/`getCurrentUserDisplayNameOrEmail` fall back to module-level `currentUserPersonalDetails`.
├── Task.ts L241 (createTaskAndNavigate) — undefined + TODO → PR 31
└── Task.ts L862 (editTaskAssignee) — undefined + TODO → PR 31

External callers of prepareOnboardingOnyxData:
Action callers pass undefined until Phase 2; inner builders (`getParsedComment`, `getCurrentUserAvatar`/`getCurrentUserDisplayNameOrEmail`, `buildOptimisticTaskReportAction`) all fall back to module-level variables.
├── Report/index.ts L1216 (getGuidedSetupDataForOpenReport) — undefined + TODO → PR 30
├── Report/index.ts L5048 (completeOnboarding) — add param
│   └── BaseOnboarding*.tsx components — pass from useOnyx
├── Policy/Policy.ts L2893 (buildPolicyData) — undefined + TODO → PR 32
└── TrackExpense.ts L1756 (requestMoney) — already has pdl from PR 18 ✅, forward
```

---

**PR 25: `parseReportActionHtmlToText`** (~20-25 lines)

```
ReportUtils.ts — add personalDetailsList? + currentUserPersonalDetails? params:
└── parseReportActionHtmlToText (L5742) — forward from getReportName's existing personalDetails param

Internal caller:
└── getReportName (L5791) L5866 — already has personalDetails in GetReportNameParams ✅
    └── Forward personalDetails → parseReportActionHtmlToText
    └── All external getReportName callers already pass personalDetails — no external changes needed

External callers of getReportName (ReportUtils version):
├── SearchUIUtils.ts L2132 (getTaskSections) — passes personalDetails ✅
└── ReportActionsUtils.ts L2017 (getMemberChangeMessageElements via callback) — passes personalDetails ✅
```

---

### Phase 2 (PRs 26-33): Thread through action files

Each PR takes action file functions that currently pass `undefined + TODO` and replaces them with real values threaded from components. After Phase 2, ALL callers pass real values (no remaining `undefined`).

---

**PR 26: IOU/index.ts — personalDetailsList for money request creation chains** (~40-50 lines)

```
Thread personalDetailsList through:
├── getSearchOnyxUpdate (L8191) — add pdl param, replace undefined for isOptimisticPersonalDetail at L8203
├── buildOnyxDataForMoneyRequest (L1667) — add pdl param, forward to isTestTransactionReport L1702 + getSearchOnyxUpdate L2252
├── getMoneyRequestInformation (L2387) — add pdl param, forward to buildOnyxDataForMoneyRequest L2742
├── buildOnyxDataForTestDriveIOU (L1581) — add pdl param, forward to buildOptimisticAddCommentReportAction L1601 + buildOptimisticIOUReportAction L1588
├── createSplitsAndOnyxData (L3734) — add pdl param, replace 3× undefined for isOptimisticPersonalDetail at L4025/4029/4209, forward to buildOnyxDataForMoneyRequest L4174 + buildOptimisticReportPreview L4148
└── createDistanceRequest (L4263) — add pdl param, forward to getMoneyRequestInformation L4411 + createSplitsAndOnyxData L4339

Component callers — pass from useOnyx(PERSONAL_DETAILS_LIST):
├── IOURequestStepConfirmation.tsx — pass pdl to requestMoney/trackExpense/splitBill/createDistanceRequest
├── IOURequestStepAmount.tsx — pass pdl
└── SubmitDetailsPage.tsx — pass pdl
```

---

**PR 27: IOU/index.ts — both params for update/cleanup chains** (~40-50 lines)

```
Thread both params through:
├── getUpdateMoneyRequestParams (L2947) — add currentUserPersonalDetails, forward to buildOptimisticModifiedExpenseReportAction L3072 + getTransactionDetails L3017
├── getUpdateTrackExpenseParams (L3506) — add currentUserPersonalDetails, forward to buildOptimisticModifiedExpenseReportAction L3581 + getTransactionDetails L3535
├── prepareToCleanUpMoneyRequest (L4566) — add personalDetailsList, forward to getPersonalDetailsForAccountID L4706
├── getNavigationUrlOnMoneyRequestDelete (L4753) — forward
├── cleanUpMoneyRequest (L4786) — forward
├── deleteMoneyRequest (L5129) — forward
└── buildOptimisticIOUReport (L6621) — already gets pdl from PR 7, forward to getPersonalDetailsForAccountID

Component callers:
├── IOURequestStep*.tsx pages — pass from hooks via UpdateMoneyRequest callers
├── MoneyReportHeader.tsx — pass from hooks
├── ReportDetailsPage.tsx — pass from hooks
└── PopoverReportActionContextMenu.tsx — pass from hooks via useDeleteTransactions
```

---

**PR 28: IOU/index.ts — currentUserPersonalDetails for remaining buildOptimistic callers** (~40-50 lines)

```
Thread currentUserPersonalDetails through:
├── approveMoneyRequest (L6426) — forward to buildOptimisticApprovedReportAction L6453
├── reopenReport (L6812) — forward to buildOptimisticReopenedReportAction
├── retractReport (L6996) — forward to buildOptimisticRetractedReportAction
├── unapproveExpenseReport (L7170) — forward to buildOptimisticUnapprovedReportAction
├── submitReport (L7346) — forward to buildOptimisticSubmittedReportAction
├── getReportFromHoldRequestsOnyxData (L5527) — forward to buildOptimisticReportPreview L5591
├── getPayMoneyRequestParams (L5846) — forward to getReportFromHoldRequestsOnyxData
├── cancelPayment (L7612) — forward to buildOptimisticCancelPaymentReportAction
├── prepareRejectMoneyRequestData (L8339) — forward to buildOptimisticRejectReportAction/Comment L8403/8405 + buildOptimisticMovedTransactionAction L8694 + buildOptimisticReportPreview L8693
├── markRejectViolationAsResolved (L9126) — forward to buildOptimisticMarkedAsResolvedReportAction
├── assignReportToMe (L9198) — forward to buildOptimisticChangeApproverReportAction
├── addReportApprover (L9314) — forward to buildOptimisticChangeApproverReportAction
└── updateMultipleMoneyRequests (L9573) — forward to buildOptimisticModifiedExpenseReportAction L9751 + buildOptimisticCreatedReportAction L9808

Component callers:
├── MoneyReportHeader.tsx, PayActionButton.tsx, ApproveActionButton.tsx — pass from hooks
├── RejectReasonPage.tsx, SearchRejectReasonPage.tsx — pass from hooks
└── SearchEditMultiplePage.tsx — pass from hooks
```

---

**PR 29: IOU/Split.ts + SendMoney.ts + SendInvoice.ts + Duplicate.ts + PerDiem.ts** (~40-50 lines)

```
Thread both params through:
├── Split.ts: splitBill L209, splitBillAndOpenReport L304, startSplitBill L398, completeSplitBill L755
│   └── forward to buildOptimistic* callers (IOUReportAction L423, CreatedReportAction L422, ReportPreview L963)
├── SendMoney.ts: getSendMoneyParams L92, sendMoneyElsewhere L485, sendMoneyWithWallet L533
│   └── forward to buildOptimisticReportPreview L146, buildOptimisticIOUReport L113
├── SendInvoice.ts: getSendInvoiceInformation L577, sendInvoice L722
│   └── forward to getPersonalDetailsForAccountID L599, buildOptimisticReportPreview L670
├── Duplicate.ts: mergeDuplicates L232, resolveDuplicates L436, duplicateExpenseTransaction L766
│   └── forward to buildOptimistic* callers
├── PerDiem.ts: getPerDiemExpenseInformation L288, submitPerDiemExpense L876
│   └── forward to buildOptimisticReportPreview L455, buildOnyxDataForMoneyRequest L502
└── TrackExpense.ts: getTrackExpenseInformation L813, trackExpense L2228, getConvertTrackedExpenseInformation L1199
    └── forward to buildOptimisticReportPreview L1109, getMoneyRequestInformation L1645, buildOptimisticMovedTransactionAction L1199

Component callers:
├── IOURequestStepConfirmation.tsx, IOURequestStepAmount.tsx, SubmitDetailsPage.tsx — pass from hooks
├── SplitBillDetailsPage.tsx — pass from hooks
└── MoneyReportHeader.tsx — pass from hooks
```

---

**PR 30: Report/index.ts — both params** (~40-50 lines)

```
Thread both params through:
├── openReport (L1485) — add params, forward to getGuidedSetupDataForOpenReport → prepareOnboardingOnyxData
│   └── withReportOrNotFound.tsx, ReportFetchHandler.tsx, ShareDetailsPage.tsx, etc. — pass from hooks
├── navigateToMostRecentReport (L4294) — add pdl param, forward to findLastAccessedReport
│   └── leaveGroupChat L4338, leaveRoom L4397 → ReportDetailsPage.tsx
├── getMostRecentReportID (L4320) — add pdl param, forward to findLastAccessedReport
├── addActions (L666) — already has pdl from PR 17, add currentUserPersonalDetails
├── buildOptimisticChangePolicyData (L6853) — add params, forward to buildOptimisticChangePolicyReportAction, buildOptimisticReportPreview L6799
│   └── changeReportPolicy L7014, changeReportPolicyAndInviteSubmitter L7058 → ReportChangeWorkspacePage.tsx
├── convertIOUReportToExpenseReport (L6368) — add params, forward to buildOptimisticMovedReportAction L6368/6409
├── updateDescription (L3331) — already has pdl from PR 17, add currentUserPersonalDetails for buildOptimisticRoomDescriptionUpdatedReportAction L3332
├── updatePolicyRoomName (L3958) — add currentUserPersonalDetails for buildOptimisticRenamedRoomReportAction
├── updatePolicyRoomAvatar (L1101) — add currentUserPersonalDetails for buildOptimisticRoomAvatarUpdatedReportAction
├── buildNewReportOptimisticData (L3502) — add pdl for getReportPreviewMessage
├── createGroupChat (L1767), addPolicyReport (L3753), deleteAppReport (L5699) — forward to buildOptimisticCreatedReportAction, buildOptimisticUnHoldReportAction
├── exportToIntegration (L5442), markAsManuallyExported (L5504) — forward to buildOptimisticExportIntegrationAction
└── updateReportField (L3124) — forward to buildOptimisticChangeFieldAction

Component callers — pass from hooks
```

---

**PR 31: Task.ts + Transaction.ts + MergeTransaction.ts + Hold.ts + Receipt.ts** (~40-50 lines)

```
Thread both params through:
├── Task.ts:
│   ├── createTaskAndNavigate (L103) — forward to getTaskAssigneeChatOnyxData L241, buildOptimisticTaskCommentReportAction L140, buildOptimisticCreatedReportAction L139, buildOptimisticTaskReport L123
│   ├── editTask (L641) — forward to buildOptimisticEditedTaskFieldReportAction
│   ├── editTaskAssignee (L743) — forward to getTaskAssigneeChatOnyxData L862, buildOptimisticChangedTaskAssigneeReportAction L757
│   ├── buildTaskData (L396) — forward to buildOptimisticTaskReportAction
│   ├── reopenTask (L537) — forward to buildOptimisticTaskReportAction
│   └── deleteTask (L1182) — forward to buildOptimisticTaskReportAction
│   └── NewTaskPage.tsx, TaskAssigneeSelectorModal.tsx, TaskHeaderActionButton.tsx, ReportDetailsPage.tsx — pass from hooks
├── Transaction.ts:
│   ├── changeTransactionsReport (L856) — forward to getTransactionDetails L1166, buildOptimisticCreatedReportAction L920/1314, buildOptimisticMovedTransactionAction L1373, buildOptimisticUnreportedTransactionAction L1372, buildOptimisticUnHoldReportAction L1418
│   ├── dismissDuplicateTransactionViolation — forward to buildOptimisticDismissedViolationReportAction L515
│   └── markAsCash — forward to buildOptimisticDismissedViolationReportAction L751
├── MergeTransaction.ts:
│   └── mergeTransactionRequest (L264) — forward to buildOptimisticIOUReportAction L598
├── Hold.ts:
│   ├── putOnHold (L44) — forward to buildOptimisticHoldReportAction L44, buildOptimisticHoldReportActionComment L45, buildOptimisticCreatedReportAction L63
│   └── unholdRequest (L342) — forward to buildOptimisticUnHoldReportAction L342
└── Receipt.ts:
    └── detachReceipt (L34) — forward to buildOptimisticDetachReceipt L117
    └── TransactionReceiptModalContent.tsx — pass from hooks
```

---

**PR 32: Policy/Policy.ts + Policy/Member.ts + CompanyCards.ts + other small action files** (~40-50 lines)

```
Thread both params through:
├── Policy/Policy.ts:
│   ├── buildPolicyData (L2409) — forward to prepareOnboardingOnyxData L2893, buildOptimisticClosedReportAction L543
│   ├── createWorkspaceFromIOUPayment (L4319) — forward to getReportPreviewMessage, buildOptimisticMovedReportAction L4334/4336
│   ├── createPolicyExpenseChats (L1620) — forward to buildOptimisticCreatedReportAction
│   ├── updateWorkspaceDescription (L1983) — already has pdl from PR 17
│   └── updateCustomRules (L5795) — already has pdl from PR 17
├── Policy/Member.ts:
│   ├── buildRoomMembersOnyxData (L64) — add pdl, replace undefined for isOptimisticPersonalDetail at L126
│   └── resetAccountingPreferredExporter (L248) — add pdl, forward to getPersonalDetailsForAccountID
├── CompanyCards.ts:
│   └── assignWorkspaceCompanyCard (L421) — forward to buildOptimisticCardAssignedReportAction
├── BankAccounts.ts:
│   └── pressLockedBankAccount (L1631) — forward to buildOptimisticAddCommentReportAction
├── User.ts:
│   └── respondToProactiveAppReview (L1554) — forward to buildOptimisticAddCommentReportAction
├── TeachersUnite.ts:
│   └── addSchoolPrincipal (L93) — forward to buildOptimisticCreatedReportAction
└── SuggestedFollowup.ts:
    └── resolveSuggestedFollowup (L84) — forward to buildOptimisticAddCommentReportAction

Component callers — pass from hooks
```

---

**PR 33: NextStepUtils + SearchUIUtils + remaining libs** (~40-50 lines)

```
Thread personalDetailsList through:
├── NextStepUtils:
│   └── buildNextStepNew — already has param from PR 10, action callers from PRs 26-32 now have pdl → just forward
├── SearchUIUtils.ts:
│   ├── getTransactionItemCommonFormattedProperties (L1160) — add pdl, forward to getPersonalDetailsForAccountID
│   ├── getIOUReportName (L1601) — add pdl, forward to getPersonalDetailsForAccountID
│   ├── getReportSections (L2404) — add pdl, forward to getPersonalDetailsForAccountID
│   └── getTaskSections (L2132) — forward to getReportName
│   └── getSections → Search/index.tsx, SearchStaticList.tsx — pass from hooks
├── Search.ts:
│   ├── rejectMoneyRequestInBulk (L1183) — already has pdl from PR 17, forward
│   └── exportToIntegrationOnSearch (L768) — forward to buildOptimisticExportIntegrationAction
├── Link.ts:
│   └── navigateHandler (L340, in handleDeeplinkNavigation) — add pdl, forward to findLastAccessedReport
│   └── DeepLinkHandler.tsx — pass from useOnyx
├── navigateAfterOnboarding.ts:
│   └── getReportIDAfterOnboarding (L33) — add pdl, forward to findLastAccessedReport
│   └── BaseOnboarding*.tsx — pass from useOnyx
├── OptionsListUtils:
│   └── isValidReport (L2173) — add pdl, forward to getParticipantsAccountIDsForDisplay
├── SuggestionUtils.ts — already has param from PR 10, component callers pass value
├── PersonalDetailOptionsListUtils.ts — already has param from PR 10, component callers pass value
├── DebugUtils.ts (L1465) — add login param, forward to getReasonAndReportActionThatRequiresAttention
│   └── DebugReportPage.tsx — pass from useCurrentUserPersonalDetails
├── MergeTransactionUtils.ts — already has param from PR 15, forward from action callers
├── SplitExpenses.ts — already has param from PR 15, forward from component callers
├── ReportSecondaryActionUtils.ts — already has param from PR 15, forward from component callers
└── IOU/UpdateMoneyRequest.ts — forward params to getUpdateMoneyRequestParams/getUpdateTrackExpenseParams
    └── IOURequestStep*.tsx pages — pass from hooks
```

---

### Phase 3 (PR 34): Final cleanup

**PR 34: Remove Onyx.connect, make params required, remove fallbacks** (~40-50 lines)

```
Delete:
├── Module variable declarations (L1071-1073): allPersonalDetails, allPersonalDetailLogins, currentUserPersonalDetails
├── Onyx.connect block (L1074-1083)
├── getCurrentUserAvatar helper (L1271)
└── getCurrentUserDisplayNameOrEmail helper (L1275)

Make required (remove ?):
├── All personalDetailsList params across 30+ functions
├── All currentUserPersonalDetails/currentUserAccountID/currentUserLogin params
└── Remove default values: getDisplayNameForParticipant, getIcons, getPersonalDetailsForAccountID, getTransactionDetails

Remove fallbacks:
└── All `resolvedX = param ?? moduleVariable` patterns → use param directly
```

---

## Estimated total: ~34 PRs

- **Phase 1** (PRs 2-25): Add params to ReportUtils functions + thread from component callers. Action callers use `undefined + TODO` with fallback.
- **Phase 2** (PRs 26-33): Thread params through action files, replacing all `undefined + TODO` with real values from components.
- **Phase 3** (PR 34): Remove Onyx.connect, make required, remove fallbacks.

Each PR targets 30-50 lines of actual code changes (excluding test changes). All values are threaded from React components — no reliance on `deprecatedCurrentUserAccountID` or action files' own Onyx connections.

---

## Dependencies & Order

```
Phase 1: PRs 2-25
  PRs 2-10 can merge in any order
  PR 11 depends on nothing specific (internal ReportUtils)
  PR 12 depends on nothing specific (internal ReportUtils)
  PRs 13-15 can merge in any order
  PR 16 independent
  PRs 17-18 depend on PR 16 (getParsedComment param exists)
  PR 19 depends on PR 16
  PR 20 independent
  PRs 21-22 depend on PR 20 (getCurrentUserAvatar/DisplayNameOrEmail param exists)
  PR 23 depends on PR 20
  PR 24 independent
  PR 25 independent

Phase 2: PRs 26-33
  All depend on relevant Phase 1 PRs being merged
  PRs 26-28 (IOU/index.ts) best done sequentially
  PRs 29-32 can merge in any order after 26-28
  PR 33 depends on PRs 26-32 (action files already have params to forward)

Phase 3: PR 34
  Depends on ALL PRs 1-33
```

---

## Notes

- **`getReportName` already has `personalDetails` param**: The `getReportName` function already accepts `personalDetails` in its params struct. PR 25 (parseReportActionHtmlToText) forwards this existing param — no changes needed to `getReportName`'s own external callers.
- **`getIcons` is already threaded**: All external callers pass `personalDetails` explicitly. The only change needed is removing the default `= allPersonalDetails` in the Final PR.
- **Tracking Issue**: [https://github.com/Expensify/App/issues/66413](https://github.com/Expensify/App/issues/66413)

---

## Full Call Trees (unabridged, from ReportUtils to component)

> **Note**: Line numbers in this section are from an earlier scan and may have shifted by a few lines. The PR Breakdown section above has the most recently verified line numbers. Use these trees for verifying that ALL intermediate functions get threaded.

These trees trace every caller chain from the ReportUtils leaf function up to the React component entry point. Use these to verify that ALL intermediate functions get `personalDetailsList` threaded through in some PR.

### `isOptimisticPersonalDetail` (ReportUtils.ts L1839)

```
isOptimisticPersonalDetail (ReportUtils.ts L1839)
│
├── shouldDisableDetailPage (ReportUtils.ts L2202) — forwards personalDetailsList
│   ├── ReportActionItemCreated.tsx L44 — useOnyx(PERSONAL_DETAILS_LIST) ✅
│   └── HeaderView.tsx L226 — useOnyx(PERSONAL_DETAILS_LIST) ✅
│
├── getTaskAssigneeChatOnyxData (ReportUtils.ts L10418) — NO personalDetailsList param yet
│   ├── Task.ts:createTaskAndNavigate (L103) → getTaskAssigneeChatOnyxData (L241)
│   │   ├── NewTaskPage.tsx L100
│   │   ├── NewTaskDetailsPage.tsx L76
│   │   └── ReportActionCompose.tsx L451
│   └── Task.ts:editTaskAssignee (L743) → getTaskAssigneeChatOnyxData (L862)
│       └── TaskAssigneeSelectorModal.tsx L171
│
├── Policy/Member.ts:buildRoomMembersOnyxData (L64) — NO personalDetailsList param
│   ├── buildAddMembersToWorkspaceOnyxData (Member.ts L845) → buildRoomMembersOnyxData (L863)
│   │   ├── addMembersToWorkspace (Member.ts L977)
│   │   │   ├── WorkspaceInviteMessageComponent.tsx L152
│   │   │   └── BaseOnboardingWorkspaceInvite.tsx L177
│   │   ├── Report/index.ts:changeReportPolicyAndInviteSubmitter (L7058) → buildAddMembersToWorkspaceOnyxData (L7098)
│   │   │   └── ReportChangeWorkspacePage.tsx L101
│   │   └── TrackExpense.ts:shareTrackedExpense (L2111) → buildAddMembersToWorkspaceOnyxData (L2171)
│   │       └── trackExpense (L2228) → shareTrackedExpense (L2519)
│   │           ├── IOURequestStepConfirmation.tsx
│   │           ├── IOURequestStepAmount.tsx
│   │           ├── SubmitDetailsPage.tsx
│   │           └── MoneyRequest.ts → useReceiptScan → IOURequestStepScan
│   └── Report/index.ts:moveIOUReportToPolicyAndInviteSubmitter (L6109) → buildRoomMembersOnyxData (L6184)
│       ├── ReportChangeWorkspacePage.tsx L93
│       ├── useSearchBulkActions.ts L625 → SearchBulkActionsButton.tsx
│       └── BaseKYCWall.tsx L147
│
├── IOU/index.ts:createSplitsAndOnyxData (L3734) — NO personalDetailsList param
│   │   Uses isOptimisticPersonalDetail at L4025, L4029, L4209
│   ├── Split.ts:splitBill (L181) → createSplitsAndOnyxData (L210)
│   │   └── IOURequestStepConfirmation.tsx L1007
│   ├── Split.ts:splitBillAndOpenReport (L276) → createSplitsAndOnyxData (L305)
│   │   └── IOURequestStepConfirmation.tsx L1043
│   ├── Split.ts:startSplitBill (L372) → createSplitsAndOnyxData
│   │   ├── IOURequestStepConfirmation.tsx L975
│   │   ├── ReceiptUploadRetryHandler/handleFileRetry.ts L27
│   │   └── MoneyRequest.ts L396 → useReceiptScan → IOURequestStepScan
│   └── IOU/index.ts:createDistanceRequest (L4263) — SPLIT branch → createSplitsAndOnyxData (L4339)
│       ├── IOURequestStepConfirmation.tsx L957
│       ├── MoneyRequest.ts:handleMoneyRequestStepDistanceNavigation (L565)
│       │   ├── IOURequestStepDistance.tsx L310
│       │   ├── IOURequestStepDistanceMap.tsx L304
│       │   ├── IOURequestStepDistanceManual.tsx L218
│       │   ├── IOURequestStepDistanceOdometer.tsx L469
│       │   └── IOURequestStepDistanceGPS/index.native.tsx L100
│       └── Duplicate.ts:createExpenseByType (L564) → createDistanceRequest (L619)
│           └── duplicateExpenseTransaction (L766) → MoneyReportHeader.tsx
│
├── IOU/index.ts:getSearchOnyxUpdate (L8191) — NO personalDetailsList param
│   │   Uses isOptimisticPersonalDetail at L8203
│   ├── IOU/index.ts:buildOnyxDataForMoneyRequest (L1667) → getSearchOnyxUpdate (L2252)
│   │   ├── getMoneyRequestInformation (L2387) → buildOnyxDataForMoneyRequest (L2742)
│   │   │   ├── TrackExpense.ts:requestMoney (L1546) → getMoneyRequestInformation (L1645)
│   │   │   │   ├── IOURequestStepConfirmation.tsx L499
│   │   │   │   ├── IOURequestStepAmount.tsx L253
│   │   │   │   ├── SubmitDetailsPage.tsx L185
│   │   │   │   ├── MoneyRequest.ts:createTransaction (L256)
│   │   │   │   │   └── useReceiptScan → IOURequestStepScan
│   │   │   │   ├── ReceiptUploadRetryHandler/handleFileRetry.ts L45
│   │   │   │   └── Duplicate.ts:createExpenseByType (L635) → duplicateExpenseTransaction → MoneyReportHeader.tsx
│   │   │   ├── createDistanceRequest (L4263) — non-SPLIT → getMoneyRequestInformation (L4411)
│   │   │   │   └── (same component callers as above)
│   │   │   ├── Split.ts:updateSplitTransactions (L1060) → getMoneyRequestInformation (L1375)
│   │   │   │   ├── Split.ts:updateSplitTransactionsFromSplitExpensesFlow (L2195) → SplitExpensePage.tsx L301
│   │   │   │   └── useDeleteTransactions (L148) → MoneyReportHeader.tsx, ReportDetailsPage.tsx, PopoverReportActionContextMenu.tsx, MoneyRequestHeaderSecondaryActions.tsx
│   │   │   └── TrackExpense.ts:convertBulkTrackedExpensesToIOU (L1862) → getMoneyRequestInformation (L1988)
│   │   │       └── AddUnreportedExpenseFooter.tsx L72
│   │   ├── createSplitsAndOnyxData (L3734) → buildOnyxDataForMoneyRequest (L4174)
│   │   │   └── (same component callers as createSplitsAndOnyxData above)
│   │   ├── Split.ts:completeSplitBill (L755) → buildOnyxDataForMoneyRequest (L971)
│   │   │   └── SplitBillDetailsPage.tsx L87
│   │   └── PerDiem.ts:getPerDiemExpenseInformation (L288) → buildOnyxDataForMoneyRequest (L502)
│   │       └── submitPerDiemExpense (L876) → IOURequestStepConfirmation.tsx, Duplicate.ts
│   ├── TrackExpense.ts:buildOnyxDataForTrackExpense (L227) → getSearchOnyxUpdate (L602)
│   │   └── getTrackExpenseInformation (L813) → trackExpense (L2228)
│   │       ├── IOURequestStepConfirmation.tsx
│   │       ├── IOURequestStepAmount.tsx
│   │       ├── SubmitDetailsPage.tsx
│   │       ├── MoneyRequest.ts → useReceiptScan → IOURequestStepScan
│   │       └── Duplicate.ts:trackExpense → MoneyReportHeader.tsx
│   └── SendInvoice.ts:buildOnyxDataForInvoice (L121) → getSearchOnyxUpdate (L535)
│       └── getSendInvoiceInformation (L577) → sendInvoice (L722)
│           ├── IOURequestStepConfirmation.tsx L1079
│           └── IOURequestStepCompanyInfo.tsx L93
│
├── UserDetailsRenderer.tsx L26 — useOnyx(PERSONAL_DETAILS_LIST) ✅
│
└── ReportActionItemSingle.tsx L142 — useOnyx(PERSONAL_DETAILS_LIST) ✅
```

### `isTestTransactionReport` (ReportUtils.ts L12816)

```
isTestTransactionReport (ReportUtils.ts L12816)
│
├── buildOptimisticReportPreview (ReportUtils.ts L7556) — forwards personalDetailsList
│   ├── SendMoney.ts:getSendMoneyParams (L63) → buildOptimisticReportPreview (L146)
│   │   ├── sendMoneyElsewhere (L485)
│   │   │   ├── IOURequestStepConfirmation.tsx L1217
│   │   │   └── IOURequestStepAmount.tsx L246
│   │   └── sendMoneyWithWallet (L533)
│   │       ├── IOURequestStepConfirmation.tsx L1234
│   │       └── IOURequestStepAmount.tsx L243
│   │
│   ├── SendInvoice.ts:getSendInvoiceInformation (L577) → buildOptimisticReportPreview (L670)
│   │   └── sendInvoice (L722)
│   │       ├── IOURequestStepCompanyInfo.tsx L93
│   │       └── IOURequestStepConfirmation.tsx L1079
│   │
│   ├── PerDiem.ts:getPerDiemExpenseInformation (L288) → buildOptimisticReportPreview (L455)
│   │   └── submitPerDiemExpense (L876)
│   │       ├── IOURequestStepConfirmation.tsx L638
│   │       └── Duplicate.ts:createExpenseByType (L632) → duplicateExpenseTransaction → MoneyReportHeader.tsx
│   │
│   ├── TrackExpense.ts:getTrackExpenseInformation (L813) → buildOptimisticReportPreview (L1109)
│   │   └── trackExpense (L2228)
│   │       ├── IOURequestStepConfirmation.tsx
│   │       ├── IOURequestStepAmount.tsx L285
│   │       ├── SubmitDetailsPage.tsx L145
│   │       ├── MoneyRequest.ts → useReceiptScan → IOURequestStepScan
│   │       └── Duplicate.ts → MoneyReportHeader.tsx
│   │
│   ├── IOU/index.ts:getMoneyRequestInformation (L2387) → buildOptimisticReportPreview (L2693)
│   │   └── (same tree as isOptimisticPersonalDetail → getMoneyRequestInformation above)
│   │
│   ├── IOU/index.ts:createSplitsAndOnyxData (L3734) → buildOptimisticReportPreview (L4148)
│   │   └── (same tree as isOptimisticPersonalDetail → createSplitsAndOnyxData above)
│   │
│   ├── IOU/index.ts:getReportFromHoldRequestsOnyxData (L5527) → buildOptimisticReportPreview (L5591)
│   │   ├── getPayMoneyRequestParams (L5846)
│   │   │   ├── payMoneyRequest (L7860) → PayActionButton.tsx, MoneyReportHeader.tsx, PayPrimaryAction.tsx, useHoldMenuSubmit → HoldMenuModalWrapper/ProcessMoneyReportHoldMenu
│   │   │   └── payInvoice (L7916) → MoneyReportHeader.tsx, PayPrimaryAction.tsx, PayActionButton.tsx
│   │   └── approveMoneyRequest (L6426) → PayActionButton, ApproveActionButton, MoneyReportHeader, PaymentUtils → SettlementButton, useConfirmApproval → ApprovePrimaryAction/PayPrimaryAction, useHoldMenuSubmit
│   │
│   ├── IOU/index.ts:prepareRejectMoneyRequestData (L8339) → buildOptimisticReportPreview (L8693)
│   │   ├── rejectMoneyRequest (L9104) → RejectReasonPage.tsx L46
│   │   └── Search.ts:rejectMoneyRequestInBulk (L1141) → rejectMoneyRequestsOnSearch (L1195)
│   │       └── SearchRejectReasonPage.tsx L54
│   │
│   ├── Report/index.ts:buildOptimisticChangePolicyData (L6531) → buildOptimisticReportPreview (L6799)
│   │   ├── changeReportPolicy (L7014) → ReportChangeWorkspacePage.tsx L115
│   │   └── changeReportPolicyAndInviteSubmitter (L7058) → ReportChangeWorkspacePage.tsx L101
│   │
│   └── Split.ts:completeSplitBill (L755) → buildOptimisticReportPreview (L963)
│       └── SplitBillDetailsPage.tsx L87
│
└── IOU/index.ts:buildOnyxDataForMoneyRequest (L1667) — uses isTestTransactionReport at L1702
    ├── getMoneyRequestInformation (L2387) → (same tree as above)
    ├── createSplitsAndOnyxData (L3734) → (same tree as above)
    ├── Split.ts:completeSplitBill (L755) → SplitBillDetailsPage.tsx
    └── PerDiem.ts:getPerDiemExpenseInformation (L288) → submitPerDiemExpense → IOURequestStepConfirmation.tsx
```

---

### `hasExpensifyGuidesEmails` (ReportUtils.ts L2261)

```
hasExpensifyGuidesEmails (ReportUtils.ts L2261) — NO personalDetailsList param
│
├── findLastAccessedReport (ReportUtils.ts L2279) — NO personalDetailsList param
│   ├── ReportRouteParamHandler.tsx L38
│   ├── ReportsSplitNavigator.tsx L54
│   ├── Link.ts:handleDeeplinkNavigation → navigateHandler (L340) — NO pdl
│   │   └── DeepLinkHandler.tsx L53, L70
│   ├── navigateAfterOnboarding.ts:getReportIDAfterOnboarding (L33) — NO pdl
│   │   └── navigateAfterOnboardingWithMicrotaskQueue (L78) — NO pdl
│   │       ├── BaseOnboardingPersonalDetails.tsx
│   │       ├── BaseOnboardingWorkspaceInvite.tsx
│   │       ├── BaseOnboardingInterestedFeatures.tsx
│   │       ├── BaseOnboardingWorkspaces.tsx
│   │       ├── BaseOnboardingWorkspaceOptional.tsx
│   │       └── useAutoCreateTrackWorkspace.ts → BaseOnboardingPurpose.tsx
│   ├── Report/index.ts:navigateToMostRecentReport (L4294) — NO pdl
│   │   ├── leaveGroupChat (L4338) → ReportDetailsPage.tsx L335
│   │   └── leaveRoom (L4397) → ReportDetailsPage.tsx L340
│   └── Report/index.ts:getMostRecentReportID (L4320) — NO pdl
│
└── canSeeDefaultRoom (ReportUtils.ts L9063) — NO personalDetailsList param
    └── canAccessReport (ReportUtils.ts L9083) — NO pdl
        ├── reasonForReportToBeInOptionList (L9489) — NO pdl
        │   └── shouldReportBeInOptionList (L9679) — NO pdl
        │       ├── SidebarUtils:shouldDisplayReportInLHN (L291) → getReportsToDisplayInLHN (L330) — NO pdl
        │       │   └── useSidebarOrderedReports.tsx L209
        │       ├── OptionsListUtils:isValidReport (L2173) → getValidOptions (L2433) — has personalDetails in config
        │       │   ├── NewChatPage.tsx L103
        │       │   └── getSearchOptions → SearchAutocompleteList.tsx, SearchFiltersChatsSelector.tsx, ShareTab.tsx
        │       └── UnreadIndicatorUpdater/index.ts L55
        ├── canCurrentUserOpenReport (L10727) — NO pdl
        │   └── ReportActionItemParentAction.tsx L236
        ├── withReportOrNotFound.tsx L100 — NO pdl (HOC wrapping many screens)
        └── withReportAndReportActionOrNotFound.tsx L79 — NO pdl
```

### `isJoinRequestInAdminRoom` (ReportUtils.ts L2423)

```
isJoinRequestInAdminRoom (ReportUtils.ts L2423) — NO personalDetailsList param (reads currentUserPersonalDetails?.login)
│
├── getReasonAndReportActionThatRequiresAttention (ReportUtils.ts L4259) — NO pdl
│   ├── requiresAttentionFromCurrentUser (L4373) — NO pdl
│   │   └── reasonForReportToBeInOptionList (L9583) → shouldReportBeInOptionList → SidebarUtils LHN chain (see above)
│   ├── generateReportAttributes (L12849) — NO pdl
│   │   └── reportAttributes.ts L262 (OnyxDerived config)
│   ├── DebugUtils.getReasonAndReportActionForGBRInLHNRow (L1465) — NO pdl
│   │   └── DebugReportPage.tsx L88
│   └── useOptimisticNextStep (hooks, L78) — NO pdl
│       └── MoneyReportHeaderNextStep.tsx L21 → MoneyReportHeaderMoreContent.tsx → MoneyReportHeader.tsx
│
└── SidebarUtils:getOptionData (L1210) — has personalDetails param ✅
    └── OptionRowLHNData.tsx L135
```

### `getChatRoomSubtitle` (ReportUtils.ts L6074)

```
getChatRoomSubtitle (ReportUtils.ts L6074) — NO personalDetailsList param
│
├── AvatarWithDisplayName.tsx L202
├── HeaderView.tsx L150
├── ReportDetailsPage.tsx L235
├── ShareCodePage.tsx L100
├── Task.ts:getShareDestination (L1126) — has personalDetails param ✅
│   └── NewTaskPage.tsx L50
├── SidebarUtils:getOptionData (L825) — has personalDetails param ✅
│   └── OptionRowLHNData.tsx L135
└── OptionsListUtils:createOption (L1079) — has personalDetails param ✅
    ├── processReport → createOptionList → OptionListContextProvider.tsx
    ├── createFilteredOptionList → useFilteredOptions → NewChatPage.tsx, ShareTab.tsx
    ├── createOptionFromReport → OptionListContextProvider.tsx, SearchRouter.tsx, SearchFiltersChatsSelector.tsx
    ├── getReportOption → IOURequestStepAmount.tsx, IOURequestStepConfirmation.tsx, SubmitDetailsPage.tsx, MoneyRequest.ts
    ├── getReportDisplayOption → ShareDetailsPage.tsx
    ├── getPolicyExpenseReportOption → MoneyRequestParticipantsSelector.tsx, SplitBillDetailsPage.tsx, MoneyRequestAttendeeSelector.tsx
    └── filterUserToInvite → getValidOptions → getSearchOptions → search UIs
```

### `getParentNavigationSubtitle` (ReportUtils.ts L6127)

```
getParentNavigationSubtitle (ReportUtils.ts L6127) — NO personalDetailsList param
│
├── AvatarWithDisplayName.tsx L203
├── HeaderView.tsx L157
├── ReportDetailsPage.tsx L230
├── ShareCodePage.tsx L100
└── ExpenseReportListItemRow.tsx L243
```

### `getParticipantsAccountIDsForDisplay` (ReportUtils.ts L3493)

```
getParticipantsAccountIDsForDisplay (ReportUtils.ts L3493) — NO personalDetailsList param
│
├── getParticipantsList (ReportUtils.ts L3536) — has personalDetails param ✅
│   ├── getReportPersonalDetailsParticipants (L12890) — has personalDetailsParam ✅
│   │   ├── RoomMembersPage.tsx L86
│   │   └── ReportParticipantsPage.tsx L94
│   └── ReportDetailsPage.tsx L250
├── navigateToDetailsPage (ReportUtils.ts L6189) — NO pdl
│   ├── MoneyRequestHeaderSecondaryActions.tsx L397
│   ├── AvatarWithDisplayName.tsx L223
│   ├── MoneyReportHeader.tsx L1292
│   ├── ReportActionItemCreated.tsx L60
│   └── HeaderView.tsx L307
├── goBackToDetailsPage (ReportUtils.ts L6207) — NO pdl
│   ├── PrivateNotesEditPage.tsx L107
│   └── PrivateNotesListPage.tsx L95
├── goBackFromPrivateNotes (ReportUtils.ts L6247) — NO pdl
│   └── PrivateNotesEditPage.tsx L131
├── OptionsListUtils:getReportOption (L1167) — has personalDetails ✅
├── OptionsListUtils:getReportDisplayOption (L1230) — has personalDetails ✅
├── OptionsListUtils:processReport (L1422) — has personalDetails ✅
├── OptionsListUtils:createFilteredOptionList (L1575) — has personalDetails ✅
├── OptionsListUtils:createOptionFromReport (L1655) — has personalDetails ✅
├── OptionsListUtils:isValidReport (L2173) — NO pdl
│   └── getValidOptions → getSearchOptions → search UIs
├── SidebarUtils:getOptionData (L765) — has personalDetails ✅
├── Task.ts:getShareDestination (L1108) — has personalDetails ✅
├── ReportWelcomeText.tsx L64, L110
├── InviteReportParticipantsPage.tsx L51
├── ShareCodePage.tsx L95
├── RoomInvitePage.tsx L114
├── AccountManagerBanner.tsx L33
├── ReportDetailsPage.tsx L577
├── HeaderView.tsx L129
└── DebugReportActions.tsx L58
```

### `getPersonalDetailsForAccountID` (ReportUtils.ts L3368) — has optional `personalDetailsData?` param

```
getPersonalDetailsForAccountID (ReportUtils.ts L3368) — optional personalDetailsData param
│
├── (PASS personalDetailsData — already threaded ✅)
│   ├── IOURequestStepReport.tsx L76
│   ├── SearchTransactionsChangeReport.tsx L95
│   └── IOURequestEditReport.tsx L53
│
├── buildOptimisticIOUReport (ReportUtils.ts L6621) — OMIT — NO pdl
│   ├── IOU/Split.ts L913
│   ├── IOU/SendMoney.ts L113
│   ├── IOU/PerDiem.ts L378
│   └── IOU/index.ts L2540, L4068, L5583
│
├── IOU/index.ts:prepareToCleanUpMoneyRequest (L4566) — OMIT at L4706 — NO pdl
│   ├── getNavigationUrlOnMoneyRequestDelete (L4753) → ReportDetailsPage.tsx, MoneyReportHeader.tsx
│   ├── cleanUpMoneyRequest (L4786) → MoneyRequestReceiptView.tsx, PureReportActionItem.tsx
│   └── deleteMoneyRequest (L5129) → useDeleteTransactions → MoneyReportHeader, PopoverReportActionContextMenu, etc.
│
├── IOU/SendInvoice.ts:getSendInvoiceInformation (L599) — OMIT — NO pdl
│   └── sendInvoice → IOURequestStepConfirmation.tsx, IOURequestStepCompanyInfo.tsx
│
├── Policy/Member.ts:resetAccountingPreferredExporter (L248) — OMIT — NO pdl
│   ├── removeMembers (L332) → WorkspaceMembersPage.tsx, WorkspaceMemberDetailsPage.tsx
│   └── buildUpdateWorkspaceMembersRoleOnyxData (L628) → updateWorkspaceMembersRole → WorkspaceMemberDetailsRolePage.tsx, WorkspaceMembersPage.tsx
│
├── SearchUIUtils.ts L1160, L1601, L2404 — OMIT — NO pdl
│   └── getSections → Search/index.tsx, SearchStaticList.tsx, TransactionGroupListItem.tsx, etc.
│
└── NextStepUtils.ts L304, L481 — OMIT — NO pdl
    └── buildNextStepNew → many action modules (IOU, Report, Transaction, Policy, Hold, PerDiem) → many .tsx
```

### `getDisplayNameForParticipant` (ReportUtils.ts L3396) — has optional `personalDetailsData` param

```
getDisplayNameForParticipant (ReportUtils.ts L3396) — optional personalDetailsData param (default = allPersonalDetails)
│
├── (PASS personalDetailsData — already threaded ✅)
│   ├── useReportActionAvatars.ts L209
│   ├── OptionsListUtils:createSearchOption L1115 (conditional)
│   ├── ReportNameUtils:buildReportNameFromParticipantNames L212/223
│   ├── ReportNameUtils:computeReportName L989
│   ├── ReportAddApproverPage.tsx L72
│   ├── SearchAddApproverPage.tsx L103
│   └── SearchFiltersParticipantsSelector.tsx L129
│
├── (OMIT personalDetailsData — component callers)
│   ├── TaskView.tsx L206
│   ├── MoneyRequestReportPreviewContent.tsx L217, L232
│   ├── ShareCodePage.tsx L96
│   ├── WorkspaceMembersPage.tsx L173–185 (4 calls)
│   ├── QuickActionMenuItem.tsx L88
│   ├── ReportTypingIndicator.tsx L34
│   └── UserSelectionListItem.tsx L64
│
├── (OMIT — lib callers needing param threaded from components)
│   ├── ReportNameUtils:getGroupChatName L275/285 — NO pdl
│   │   ├── NewChatConfirmPage.tsx, GroupChatNameEditPage.tsx, InviteReportParticipantsPage.tsx
│   │   └── computeReportName L949 → reportAttributes.ts (OnyxDerived)
│   ├── ReportNameUtils:getMoneyRequestReportName L388/404 — NO pdl
│   │   └── computeReportName, getReportName
│   ├── SidebarUtils:getWelcomeMessage L1291/1364 — has personalDetails ✅
│   │   └── ReportWelcomeText.tsx L114, DebugReportActions.tsx L76
│   ├── PersonalDetailOptionsListUtils:createOption L68 — NO pdl
│   ├── SuggestionUtils:getDisplayName L28 — NO pdl
│   │   └── SuggestionMention.tsx L350
│   └── NextStepUtils L49/304/475/479/481/787 — NO pdl
│       └── buildNextStepMessage → MoneyReportHeaderStatusBar.tsx
│
├── (OMIT — internal ReportUtils callers)
│   ├── getDisplayNamesWithTooltips L3958 — has personalDetailsList ✅
│   │   └── ReportDetailsPage, SidebarUtils, AvatarWithDisplayName, NewTaskPage, TaskView, HeaderView, OptionRow, PureReportActionItem
│   ├── getUserDetailTooltipText L4009 — NO pdl
│   │   └── AttendeesCell, BaseUserDetailsTooltip, ReportActionAvatar
│   ├── getReimbursementQueuedActionMessage L4038 — has optional personalDetails
│   ├── getReimbursementDeQueuedOrCanceledActionMessage L4070 — NO pdl
│   ├── getReportPreviewMessage L5349 (5 call sites) — NO pdl
│   │   └── OptionsListUtils, ContextMenuActions, Report/index, Policy/Policy, buildOptimisticReportPreview, updateReportPreview
│   ├── getPayeeName L6029 — NO pdl
│   ├── getParentNavigationSubtitle L6127 — NO pdl (see above)
│   ├── buildOptimisticIOUReportAction L7125 — NO pdl
│   ├── buildOptimisticChangedTaskAssigneeReportAction L8308 — NO pdl
│   ├── buildOptimisticChangeApproverReportAction L8449 — NO pdl
│   └── getWhisperDisplayNames L10143 — NO pdl
│       └── PureReportActionItem.tsx L2191
```

### `getTransactionDetails` (ReportUtils.ts L4634) — has optional `currentUserDetails` param

```
getTransactionDetails (ReportUtils.ts L4634) — optional currentUserDetails param (default = currentUserPersonalDetails)
│
├── (PASS currentUserDetails ✅)
│   └── MoneyRequestView.tsx L275
│
├── (OMIT — component callers)
│   ├── TotalCell.tsx L15
│   ├── useEReceipt.tsx L30 → EReceipt.tsx, EReceiptThumbnail.tsx
│   ├── AddUnreportedExpense.tsx L97
│   ├── TransactionPreview/index.tsx L72
│   ├── PerDiemEReceipt.tsx L63
│   ├── IOURequestStepAmount.tsx L119/120/391
│   ├── DistanceEReceipt.tsx L35
│   ├── DetailsReviewPage.tsx L88
│   ├── SplitExpenseEditPage.tsx L61
│   ├── SplitExpensePage.tsx L129
│   ├── IOURequestStepMerchant.tsx L62
│   ├── EReceipt.tsx L97
│   ├── IOURequestStepCategory.tsx L82
│   ├── TransactionPreviewContent.tsx L79
│   └── IOURequestStepTaxAmountPage.tsx L79
│
├── (OMIT — internal ReportUtils callers)
│   ├── getBillableAndTaxTotal (L4422) → MoneyRequestReportTransactionList.tsx, MoneyReportView.tsx
│   └── createDraftTransactionAndNavigateToParticipantSelector (L11364) → PureReportActionItem.tsx, ReportDetailsPage.tsx
│
├── (OMIT — action/lib callers)
│   ├── Transaction.ts:changeTransactionsReport (L856) L1166 — NO pdl
│   │   └── SearchTransactionsChangeReport.tsx, NewReportWorkspaceSelectionPage.tsx, AddUnreportedExpenseFooter.tsx, IOURequestStepReport.tsx, IOURequestEditReport.tsx
│   ├── IOU/index.ts:getUpdateMoneyRequestParams (L2947) L3017 — NO pdl
│   │   ├── IOU/UpdateMoneyRequest.ts (many functions) → IOURequestStep*.tsx pages
│   │   ├── IOU/Split.ts:updateSplitTransactions L1446 — has personalDetails ✅
│   │   └── MergeTransaction.ts:getOnyxTargetTransactionData L240 → mergeTransactionRequest → ConfirmationPage.tsx
│   ├── IOU/index.ts:getUpdateTrackExpenseParams (L3506) L3535 — NO pdl
│   ├── IOU/index.ts:removeUnchangedBulkEditFields (L9426) — NO pdl
│   │   └── updateMultipleMoneyRequests → SearchEditMultiplePage.tsx
│   ├── MergeTransactionUtils.ts L223/224/497/624 — NO pdl
│   │   └── setupMergeTransactionDataAndNavigate → MoneyReportHeader.tsx, MoneyRequestHeaderSecondaryActions.tsx, MergeTransactionsListContent.tsx
│   │   └── DetailsReviewPage.tsx, ReceiptReviewPage.tsx
│   ├── ReportSecondaryActionUtils.ts:isSplitAction (L107) L120 — NO pdl
│   │   └── SplitExpensePage.tsx, SplitExpenseEditPage.tsx, MoneyRequestView.tsx, Search/index.tsx, useSelectedTransactionsActions.ts
│   ├── SplitExpenses.ts:initSplitExpense (L41) L57/86 — NO pdl
│   │   └── useSelectedTransactionsActions.ts, MoneyRequestHeaderSecondaryActions.tsx, useSearchBulkActions.ts, MoneyReportHeader.tsx, MoneyRequestView.tsx
│   ├── IOU/Split.ts:completeSplitBill L1033 — NO pdl → SplitBillDetailsPage.tsx
│   ├── IOU/Split.ts:updateSplitTransactions L1088/1410 — has personalDetails ✅
│   ├── IOU/Split.ts:initSplitExpenseItemData L2481 — NO pdl → SplitExpensePage.tsx
│   ├── IOU/Split.ts:initDraftSplitExpenseDataForEdit L2514 — NO pdl → SplitExpensePage.tsx, SplitExpenseEditPage.tsx
│   ├── IOU/Split.ts:resetSplitExpensesByDateRange L2753 — NO pdl → SplitExpenseCreateDateRagePage.tsx
│   ├── IOU/Split.ts:updateSplitExpenseField L2841 — NO pdl → SplitExpenseEditPage.tsx
│   ├── IOU/Duplicate.ts:duplicateExpenseTransaction L690 — has personalDetails ✅ → MoneyReportHeader.tsx
│   └── IOU/Duplicate.ts:duplicateReport L871 — has personalDetails ✅ → MoneyReportHeader.tsx
```

### `getParsedComment` (ReportUtils.ts L6304) — NO personalDetailsList param (uses module allPersonalDetailLogins)

```
getParsedComment (ReportUtils.ts L6304) — NO personalDetailsList param
│
├── (Internal ReportUtils wrappers)
│   ├── buildOptimisticAddCommentReportAction (L6386) L6398 — NO pdl
│   ├── buildOptimisticEditedTaskFieldReportAction (L8240) L8269 — NO pdl
│   ├── buildOptimisticTaskReport (L8665) L8688/8689 — NO pdl
│   ├── getCommentLength (L9802) L9803 — NO pdl
│   └── buildOptimisticRejectReportActionComment (L13017) L13027 — NO pdl
│
├── (Component callers)
│   ├── TaskTitlePage.tsx L48
│   ├── WorkspaceNewRoomPage.tsx L123
│   └── SplitExpenseEditPage.tsx L102
│
├── (Action callers)
│   ├── Task.ts:editTask L645/649 → TaskDescriptionPage.tsx, TaskTitlePage.tsx
│   ├── Report/index.ts:addActions L705 → addComment/addAttachmentWithComment → ReportActionCompose.tsx, ShareDetailsPage.tsx, etc.
│   ├── Report/index.ts:updateDescription L3331 → RoomDescriptionPage.tsx
│   ├── Policy/Policy.ts:updateWorkspaceDescription L1983 → WorkspaceOverviewDescriptionPage.tsx
│   ├── Policy/Policy.ts:updateCustomRules L5795 → RulesCustomPage.tsx
│   ├── Search.ts:rejectMoneyRequestInBulk L1183
│   ├── SendMoney.ts L92
│   ├── SendInvoice.ts L739
│   ├── IOU/UpdateMoneyRequest.ts L621
│   ├── IOU/TrackExpense.ts L1577/1940/2253
│   ├── IOU/Split.ts L209/304/398/771/1143/1366
│   ├── IOU/index.ts:createDistanceRequest L4285
│   ├── IOU/index.ts:prepareRejectMoneyRequestData L8404
│   └── IOU/index.ts:updateMultipleMoneyRequests L9573
```

### `buildOptimisticAddCommentReportAction` (ReportUtils.ts L6386)

```
buildOptimisticAddCommentReportAction (ReportUtils.ts L6386) — NO personalDetailsList param
│
├── Report/index.ts:addActions (L666) L689/698 — NO pdl
│   ├── addComment (L961) → ReportActionCompose.tsx, ShareDetailsPage.tsx, TravelTerms.tsx, ChronosTimerHeaderButton.tsx
│   ├── addAttachmentWithComment (L919) → ReportActionCompose.tsx, ShareDetailsPage.tsx, MoneyRequestReceiptView.tsx
│   ├── explain (L2161) → ContextMenuActions.tsx, ReportActionItemMessageWithExplain.tsx
│   ├── inviteToRoomAction (L4638) → RoomInvitePage.tsx
│   └── resolveConcierge*Options (L7177) → PureReportActionItem.tsx
├── buildOptimisticTaskCommentReportAction (ReportUtils.ts L6527) L6538 — NO pdl
│   ├── Task.ts:createTaskAndNavigate (L103) L140 → NewTaskPage.tsx, NewTaskDetailsPage.tsx, ReportActionCompose.tsx
│   ├── getTaskAssigneeChatOnyxData (ReportUtils.ts L10413) L10538
│   └── prepareOnboardingOnyxData L11885
├── prepareOnboardingOnyxData (ReportUtils.ts L11700) L11791/11808/11930 — NO pdl
├── IOU/index.ts:buildOnyxDataForTestDriveIOU (L1581) L1601 — NO pdl
├── IOU/Split.ts L1484 — NO pdl → IOURequestStepConfirmation.tsx, SplitBillDetailsPage.tsx
├── BankAccounts.ts:pressLockedBankAccount (L1631) — NO pdl
│   └── WorkspaceWorkflowsPage.tsx, SettlementButton, WalletPage
├── User.ts:respondToProactiveAppReview (L1554) — NO pdl
│   └── ProactiveAppReviewModalManager.tsx
└── SuggestedFollowup.ts:resolveSuggestedFollowup (L84) — NO pdl
    └── PureReportActionItem.tsx L949
```

### `getCurrentUserAvatar` / `getCurrentUserDisplayNameOrEmail` (ReportUtils.ts L1271/1275) — internal

Called by 28+ `buildOptimistic*` functions. See PRs 20-22 for the full list.

### `buildOptimisticModifiedExpenseReportAction` (ReportUtils.ts L7647)

```
buildOptimisticModifiedExpenseReportAction (ReportUtils.ts L7647) — NO currentUserPersonalDetails param
│
├── IOU/index.ts:getUpdateMoneyRequestParams (L2947) L3072 — NO pdl
│   ├── IOU/UpdateMoneyRequest.ts (many update* functions) → IOURequestStep*.tsx pages
│   ├── IOU/Split.ts:updateSplitTransactions L1446 → SplitExpensePage.tsx, useDeleteTransactions
│   └── MergeTransaction.ts:mergeTransactionRequest L264 → ConfirmationPage.tsx
├── IOU/index.ts:getUpdateTrackExpenseParams (L3506) L3581 — NO pdl
│   └── IOU/UpdateMoneyRequest.ts → IOURequestStep*.tsx pages
└── IOU/index.ts:updateMultipleMoneyRequests L9751 — NO pdl
    └── SearchEditMultiplePage.tsx
```

### `buildOptimisticDetachReceipt` (ReportUtils.ts L7693)

```
buildOptimisticDetachReceipt (ReportUtils.ts L7693) — NO currentUserPersonalDetails param
│
└── IOU/Receipt.ts:detachReceipt (L34) L117 — NO pdl
    └── TransactionReceiptModalContent.tsx L255
```

### `buildOptimisticTaskReportAction` (ReportUtils.ts L7788)

```
buildOptimisticTaskReportAction (ReportUtils.ts L7788) — NO currentUserPersonalDetails param
│
├── Task.ts:buildTaskData (L396) → completeTask, reopenTask, deleteTask
│   ├── completeTask → TaskHeaderActionButton.tsx, ReportDetailsPage.tsx, TaskPreview.tsx, TaskView.tsx, TaskListItemRow.tsx
│   ├── reopenTask → TaskHeaderActionButton.tsx, ReportDetailsPage.tsx, TaskPreview.tsx, TaskView.tsx
│   └── deleteTask → ReportDetailsPage.tsx
├── Task.ts:reopenTask (L537) → (same .tsx as above)
├── Task.ts:deleteTask (L1182) → ReportDetailsPage.tsx L893
└── prepareOnboardingOnyxData (ReportUtils.ts L11700) L11901 → (see below)
```

### `getTaskAssigneeChatOnyxData` (ReportUtils.ts L10413)

```
getTaskAssigneeChatOnyxData (ReportUtils.ts L10413) — NO personalDetailsList param
│
├── Task.ts:createTaskAndNavigate (L103) L241 — NO pdl
│   ├── NewTaskPage.tsx L100
│   ├── NewTaskDetailsPage.tsx L76
│   └── ReportActionCompose.tsx L451
└── Task.ts:editTaskAssignee (L743) L862 — NO pdl
    └── TaskAssigneeSelectorModal.tsx L171
```

### `prepareOnboardingOnyxData` (ReportUtils.ts L11700)

```
prepareOnboardingOnyxData (ReportUtils.ts L11700) — NO personalDetailsList param
│
├── Report/index.ts:getGuidedSetupDataForOpenReport (L1182) L1216 — NO pdl
│   └── openReport (L1485/1834) — NO pdl
│       ├── withReportOrNotFound.tsx L94
│       ├── ReportFetchHandler.tsx L125/149
│       ├── ShareDetailsPage.tsx L156
│       ├── AuthScreensInitHandler.tsx L145
│       ├── ContextMenuActions.tsx L533
│       ├── TestDriveDemo.tsx L60
│       └── (many other .tsx via openReport)
├── Report/index.ts:completeOnboarding (L5029) L5048 — NO pdl
│   ├── BaseOnboardingPersonalDetails.tsx L152
│   ├── BaseOnboardingPurpose.tsx L110
│   ├── BaseOnboardingWorkspaces.tsx L78
│   ├── BaseOnboardingInterestedFeatures.tsx L222
│   ├── BaseOnboardingWorkspaceInvite.tsx L178/198
│   ├── BaseOnboardingWorkspaceOptional.tsx L187/267
│   ├── useAutoCreateTrackWorkspace.ts L96 → BaseOnboardingPurpose.tsx
│   └── IOU/index.ts:completePaymentOnboarding (L7844) → BaseKYCWall.tsx, AddPaymentMethodMenu.tsx
├── Policy/Policy.ts:buildPolicyData (L2409) L2893 — NO pdl
│   └── createWorkspace (L2960) → useAutoCreateTrackWorkspace.ts, IOURequestStepUpgrade.tsx, BaseOnboardingWorkspaceOptional.tsx, etc.
└── TrackExpense.ts:requestMoney (L1546) L1756 — NO pdl
    └── IOURequestStepConfirmation.tsx, IOURequestStepAmount.tsx, SubmitDetailsPage.tsx, etc.
```

### `parseReportActionHtmlToText` (ReportUtils.ts L5742)

```
parseReportActionHtmlToText (ReportUtils.ts L5742) — NO personalDetailsList param, NO currentUserPersonalDetails param
│
└── getReportName (ReportUtils.ts L5791) L5866 — has personalDetails param ✅ (GetReportNameParams)
    └── ReportActionItemMessage.tsx L26
    └── (most other UI uses ReportNameUtils.getReportName which does NOT call parseReportActionHtmlToText)
```
