# ReportActionCompose Decomposition Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the 730-line ReportActionCompose monolith into focused components with correct data ownership, eliminating duplicate subscriptions and enabling React Compiler compliance.

**Architecture:** Push subscriptions down to the narrowest owner. Extract side-effect-only concerns into renderless components. Convert the hook-returning-JSX pattern into a proper component. Remove manual memoization so the React Compiler can optimize the entire tree.

**Tech Stack:** React, TypeScript, React Native Onyx (useOnyx), React Compiler (babel-plugin-react-compiler)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx` | Modify | Slim orchestrator: local UI state + minimal subscriptions |
| `src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx` | Create | Renderless component: hides emoji picker on unmount |
| `src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx` | Create | Self-subscribing component: transaction resolution + drop zone rendering |
| `src/pages/inbox/report/ReportActionCompose/AttachmentUploadHandler.tsx` | Create | Self-subscribing component replacing useAttachmentUploadValidation hook |
| `src/pages/inbox/report/ReportActionCompose/useAttachmentUploadValidation.ts` | Delete | Replaced by AttachmentUploadHandler component |
| `src/pages/inbox/report/ReportActionCompose/SendButton.tsx` | Modify | Remove memo() wrapper |

---

## Coding Standards

Every task must comply with all rules from `/coding-standards`. Key rules for this work:

- **CLEAN-REACT-PATTERNS-0**: No manual memoization (useCallback, useMemo, React.memo). React Compiler handles it.
- **CLEAN-REACT-PATTERNS-2**: Components own their behavior. Don't pass data the child can get itself.
- **CLEAN-REACT-PATTERNS-4**: No side-effect spaghetti. Extract focused concerns.
- **CLEAN-REACT-PATTERNS-5**: Keep state narrow. Each component subscribes to exactly what it needs.
- **PERF-11**: Optimize data selection. Use selectors on useOnyx when extracting scalar values from objects.
- **CONSISTENCY-5**: Justify eslint-disable or remove it.

---

### Task 1: Remove dead `onSubmitAction` export and duplicate `useCurrentUserPersonalDetails`

**Files:**
- Modify: `src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx`

**Context:** `onSubmitAction` is a module-level mutable variable that is exported but never imported anywhere in the codebase. It is assigned inside the component body (line 498: `onSubmitAction = handleSendMessage`), which is a side effect during render -- an anti-pattern. Additionally, `useCurrentUserPersonalDetails()` is called twice (line 157 and line 232 as `personalDetail`), creating duplicate subscriptions to the same Onyx key.

- [ ] **Step 1: Verify `onSubmitAction` is unused**

Run: `cd /Users/adhorodyski/Developer/Expensify-App-w2 && grep -r "onSubmitAction" src/ --include="*.ts" --include="*.tsx" | grep -v "ReportActionCompose.tsx"`

Expected: No matches (confirming it is dead code).

- [ ] **Step 2: Remove `onSubmitAction`**

Remove these pieces from `ReportActionCompose.tsx`:
1. The `import noop from 'lodash/noop';` (line 2) -- only if no other usage exists in the file.
2. The `let onSubmitAction = noop;` (line 133) and the `// eslint-disable-next-line import/no-mutable-exports` comment above it (line 132).
3. The `onSubmitAction = handleSendMessage;` assignment (line 498).
4. The `export {onSubmitAction};` from the export line (line 728). Keep the other exports on that line.

- [ ] **Step 3: Remove duplicate `useCurrentUserPersonalDetails` call**

Line 232 calls `const personalDetail = useCurrentUserPersonalDetails();` separately from line 157's `const currentUserPersonalDetails = useCurrentUserPersonalDetails();`. The only usage of `personalDetail` is `personalDetail.timezone` on line 363.

Replace `personalDetail.timezone` with `currentUserPersonalDetails.timezone` and remove the `const personalDetail = useCurrentUserPersonalDetails();` line entirely.

- [ ] **Step 4: Remove `memo()` wrapper from ReportActionCompose**

Line 727: Change `export default memo(ReportActionCompose);` to `export default ReportActionCompose;`.

Remove `memo` from the React import on line 3. Keep other imports from react that are still used.

- [ ] **Step 5: Remove `memo()` wrapper from SendButton**

In `src/pages/inbox/report/ReportActionCompose/SendButton.tsx`:
Line 82: Change `export default memo(SendButton);` to `export default SendButton;`.

Remove `memo` from the React import on line 1. `React` itself may still be needed if JSX transform requires it -- check if other imports from react remain.

- [ ] **Step 6: Verify**

Run:
```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
npx prettier --write src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/SendButton.tsx
npx eslint src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/SendButton.tsx --max-warnings=0
npm run typecheck-tsgo
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/SendButton.tsx
git commit -m "Remove dead onSubmitAction, duplicate useCurrentUserPersonalDetails, memo wrappers"
```

---

### Task 2: Extract EmojiPickerCleanupHandler (fix eslint-disable that blocks React Compiler)

**Files:**
- Create: `src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx`
- Modify: `src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx`

**Context:** Lines 436-445 have a `useEffect` with `eslint-disable react-hooks/exhaustive-deps` for a mount-only cleanup effect that hides the emoji picker on unmount. This eslint-disable prevents the React Compiler from optimizing the entire component. The fix is to extract this into a renderless component where the empty deps are correct by construction (the component unmounts when the parent unmounts).

- [ ] **Step 1: Create EmojiPickerCleanupHandler**

Create `src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx`:

```tsx
import {useEffect} from 'react';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction} from '@userActions/EmojiPickerAction';

type EmojiPickerCleanupHandlerProps = {
    reportID: string | undefined;
};

/**
 * Renderless component that hides the emoji picker when the composer unmounts,
 * but only if the picker is active for this specific report.
 */
function EmojiPickerCleanupHandler({reportID}: EmojiPickerCleanupHandlerProps) {
    useEffect(() => {
        return () => {
            if (!isActiveEmojiPickerAction(reportID)) {
                return;
            }
            hideEmojiPicker();
        };
    }, [reportID]);

    return null;
}

export default EmojiPickerCleanupHandler;
```

- [ ] **Step 2: Replace the inline effect in ReportActionCompose**

In `ReportActionCompose.tsx`, remove lines 435-445 (the useEffect with eslint-disable):

```tsx
// REMOVE THIS ENTIRE BLOCK:
    // We are returning a callback here as we want to invoke the method on unmount only
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(report?.reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
```

Add the renderless component in the JSX return, right before the closing `</View>` of the outermost wrapper (before line 724). Place it outside the visible UI tree:

```tsx
            <EmojiPickerCleanupHandler reportID={report?.reportID} />
        </View>
    );
```

Add the import at the top of the file:
```tsx
import EmojiPickerCleanupHandler from './EmojiPickerCleanupHandler';
```

Clean up unused imports: if `isActive as isActiveEmojiPickerAction` and `hideEmojiPicker` are no longer used in ReportActionCompose.tsx (they were only used in the removed effect), remove them from the import.

- [ ] **Step 3: Fix the measureContainer eslint-disable**

Lines 280-289 have a `useCallback` with `eslint-disable react-hooks/exhaustive-deps` to include `isComposerFullSize` in the dependency array for repositioning purposes. Since React Compiler handles memoization, remove the `useCallback` wrapper entirely and make it a plain function. The compiler will handle caching.

Replace:
```tsx
    const measureContainer = useCallback(
        (callback: MeasureInWindowOnSuccessCallback) => {
            if (!containerRef.current) {
                return;
            }
            containerRef.current.measureInWindow(callback);
        },
        // We added isComposerFullSize in dependencies so that when this value changes, we recalculate the position of the popup
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isComposerFullSize],
    );
```

With:
```tsx
    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    };
```

Note: `isComposerFullSize` was in the deps to trigger re-calculation. Since the plain function captures the latest ref value on each render, and React Compiler will memoize based on actual dependencies, this is correct. The `containerRef.current.measureInWindow` always reads the current DOM position.

- [ ] **Step 4: Remove all remaining manual memoization from ReportActionCompose**

Remove ALL `useCallback` and `useMemo` wrappers in ReportActionCompose.tsx. Convert each to a plain function or expression. The React Compiler handles all memoization.

For each `useCallback((args) => { ... }, [deps])`, replace with `(args) => { ... }`.
For each `useMemo(() => expr, [deps])`, replace with just `expr` (the expression itself).

The following need conversion:
- `onAddActionPressed` (line 292) -> plain arrow function
- `onItemSelected` (line 299) -> plain arrow function
- `updateShouldShowSuggestionMenuToFalse` (line 303) -> plain arrow function
- `addAttachment` (line 314) -> plain arrow function
- `onAttachmentPreviewClose` (line 332) -> plain arrow function
- `submitForm` (line 348) -> plain arrow function
- `onTriggerAttachmentPicker` (line 400) -> plain arrow function
- `onBlur` (line 405) -> plain arrow function
- `onFocus` (line 420) -> plain arrow function
- `validateMaxLength` (line 457) -> plain arrow function
- `handleSendMessage` (line 477) -> plain arrow function
- `onValueChange` (line 530) -> plain arrow function
- `reportParticipantIDs` (line 208) -> plain expression
- `shouldShowReportRecipientLocalTime` (line 216) -> plain expression
- `includesConcierge` (line 221) -> plain expression
- `userBlockedFromConcierge` (line 222) -> plain expression
- `isBlockedFromConcierge` (line 223) -> plain expression
- `isTransactionThreadView` (line 225) -> plain expression
- `isExpensesReport` (line 226) -> plain expression
- `transactionID` (line 237) -> plain expression
- `isSingleTransactionView` (line 241) -> plain expression
- `shouldDisplayDualDropZone` (line 252) -> plain expression
- `inputPlaceholder` (line 262) -> plain expression
- `debouncedValidate` (line 471) -> needs careful handling (see below)
- `isGroupPolicyReport` (line 448) -> plain expression
- `emojiPositionValues` (line 500) -> plain expression
- `emojiShiftVertical` (line 517) -> plain expression

**Special case -- `debouncedValidate`:** The `useMemo` around `lodashDebounce` creates a stable debounced function. Without `useMemo`, a new debounced function would be created on every render, breaking the debounce. The React Compiler will handle this correctly -- it will memoize the `lodashDebounce(...)` call based on `validateMaxLength` as a dependency. Convert it to a plain expression:

```tsx
const debouncedValidate = lodashDebounce(validateMaxLength, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME, {leading: true});
```

The compiler will cache this value and only recreate it when `validateMaxLength` changes.

After all conversions, remove `useCallback`, `useMemo` from the React import line. Keep `useContext`, `useEffect`, `useRef`, `useState`.

- [ ] **Step 5: Verify**

Run:
```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
npx prettier --write src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx
npx eslint src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx --max-warnings=0
npm run typecheck-tsgo
```

Verify no eslint-disable for react-hooks remains in ReportActionCompose.tsx:
```bash
grep -n "eslint-disable.*react-hooks" src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx
```
Expected: Only the `rulesdir/prefer-shouldUseNarrowLayout` disable on the responsive layout line (this is a different rule, not react-hooks).

- [ ] **Step 6: Commit**

```bash
git add src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx
git commit -m "Extract EmojiPickerCleanupHandler, remove manual memoization for React Compiler"
```

---

### Task 3: Extract DropZoneArea (isolate transaction resolution + drop zone subscriptions)

**Files:**
- Create: `src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx`
- Modify: `src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx`

**Context:** ReportActionCompose subscribes to `COLLECTION.REPORT_ACTIONS/{reportID}`, `COLLECTION.TRANSACTION/{transactionID}`, `COLLECTION.POLICY/{policyID}`, `BETAS`, `usePreferredPolicy`, `useReportIsArchived`, and `COLLECTION.REPORT/{parentReportID}` primarily to compute `shouldDisplayDualDropZone`, `shouldAddOrReplaceReceipt`, and `hasReceipt`. These are all needed only by the drop zone rendering. Pushing them into a self-subscribing component eliminates ~8 subscriptions from the root.

- [ ] **Step 1: Create DropZoneArea component**

Create `src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx`:

```tsx
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getLinkedTransactionID, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getParentReport,
    isChatRoom,
    isGroupChat,
    isInvoiceReport,
    isReportApproved,
    isReportTransactionThread,
    isSettled,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {getTransactionID, hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type DropZoneAreaProps = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    reportTransactions: OnyxEntry<OnyxTypes.Transaction[]>;
    transactionThreadReportID: string | undefined;
    onAttachmentDrop: (event: DragEvent) => void;
    currentUserAccountID: number;
};

function DropZoneArea({reportID, report, reportTransactions, transactionThreadReportID, onAttachmentDrop, currentUserAccountID}: DropZoneAreaProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle']);
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const isReportArchived = useReportIsArchived(report?.reportID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canEvict: false});

    const isTransactionThreadView = isReportTransactionThread(report);
    const isExpensesReport = reportTransactions && reportTransactions.length > 1;

    const iouAction = reportActions ? Object.values(reportActions).find((action) => isMoneyRequestAction(action)) : null;
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;
    const transactionID = getTransactionID(report) ?? linkedTransactionID;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);

    const isSingleTransactionView = !!transaction && !!reportTransactions && reportTransactions.length === 1;
    const parentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt =
        canUserPerformWriteAction &&
        canEditFieldOfMoneyRequest({reportAction: parentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction}) &&
        !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;
    const hasReceipt = hasReceiptTransactionUtils(transaction);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserAccountID);

    const shouldDisplayDualDropZone = (() => {
        const parentReport = getParentReport(report);
        const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
        const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
        const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
        const isRoomOrGroupChat = isChatRoom(report) || isGroupChat(report);
        return !isRoomOrGroupChat && (canModifyReceipt || hasMoneyRequestOptions) && !isInvoiceReport(report);
    })();

    if (shouldDisplayDualDropZone) {
        return (
            <DualDropZone
                isEditing={shouldAddOrReplaceReceipt && hasReceipt}
                onAttachmentDrop={onAttachmentDrop}
                onReceiptDrop={onAttachmentDrop}
                shouldAcceptSingleReceipt={shouldAddOrReplaceReceipt}
            />
        );
    }

    return (
        <DragAndDropConsumer onDrop={onAttachmentDrop}>
            <DropZoneUI
                icon={icons.MessageInABottle}
                dropTitle={translate('dropzone.addAttachments')}
                dropStyles={styles.attachmentDropOverlay(true)}
                dropTextStyles={styles.attachmentDropText}
                dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.attachmentDropBorderColorActive, true)]}
            />
        </DragAndDropConsumer>
    );
}

export default DropZoneArea;
```

**Important note:** The `onReceiptDrop` prop on `DualDropZone` currently uses `onReceiptDropped` from `useAttachmentUploadValidation` in the original code, which is different from `onAttachmentDrop`. This will be fully resolved in Task 4 when `AttachmentUploadHandler` replaces the hook. For now, we'll pass the `onAttachmentDrop` handler. Task 4 will provide the correct receipt handler.

Actually -- let me reconsider. The DropZoneArea needs the receipt drop handler from the attachment upload validation logic. We need to think about this dependency more carefully. The DropZoneArea needs two handlers:
1. `onAttachmentDrop` -- for the standard attachment drop zone
2. `onReceiptDrop` -- from `useAttachmentUploadValidation`'s `onReceiptDropped`

Since Task 4 converts useAttachmentUploadValidation into a component, the handlers will live in that component. The clean approach is: DropZoneArea receives both handlers as props. The parent orchestrates by getting `onReceiptDropped` from the attachment validation and passing it down.

Update the props type:

```tsx
type DropZoneAreaProps = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    reportTransactions: OnyxEntry<OnyxTypes.Transaction[]>;
    transactionThreadReportID: string | undefined;
    onAttachmentDrop: (event: DragEvent) => void;
    onReceiptDrop: (event: DragEvent) => void;
    currentUserAccountID: number;
};
```

And update the DualDropZone usage:
```tsx
    <DualDropZone
        isEditing={shouldAddOrReplaceReceipt && hasReceipt}
        onAttachmentDrop={onAttachmentDrop}
        onReceiptDrop={onReceiptDrop}
        shouldAcceptSingleReceipt={shouldAddOrReplaceReceipt}
    />
```

- [ ] **Step 2: Update ReportActionCompose to use DropZoneArea**

In `ReportActionCompose.tsx`:

1. Remove these subscriptions/hooks/computations that are now in DropZoneArea:
   - `const [policy] = useOnyx(...)` (COLLECTION.POLICY)
   - `const [newParentReport] = useOnyx(...)` (COLLECTION.REPORT/{parentReportID}) -- but check if still needed by useAttachmentUploadValidation. If so, keep for now and remove in Task 4.
   - `const [reportActions] = useOnyx(...)` (COLLECTION.REPORT_ACTIONS/{reportID})
   - `const [transaction] = useOnyx(...)` (COLLECTION.TRANSACTION/{transactionID})
   - `const [betas] = useOnyx(...)` (ONYXKEYS.BETAS)
   - `const {isRestrictedToPreferredPolicy} = usePreferredPolicy()`
   - `const isReportArchived = useReportIsArchived(...)`
   - `const isTransactionThreadView = ...`
   - `const isExpensesReport = ...`
   - `const iouAction = ...`
   - `const linkedTransactionID = ...`
   - `const transactionID = ...`
   - `const isSingleTransactionView = ...`
   - `const parentReportAction = ...`
   - `const canUserPerformWriteAction = ...`
   - `const canEditReceipt = ...`
   - `const shouldAddOrReplaceReceipt = ...`
   - `const hasReceipt = ...`
   - `const shouldDisplayDualDropZone = ...`
   - `const reportParticipantIDs = ...` -- but check if still needed by AttachmentPickerWithMenuItems prop. If so, keep.

   **Be careful:** Some of these values are used by `useAttachmentUploadValidation` and `AttachmentPickerWithMenuItems`. Do NOT remove values that are still used elsewhere in the component. Only remove values that were exclusively used for drop zone logic. In practice:
   - `policy` is passed to `useAttachmentUploadValidation` and `AttachmentPickerWithMenuItems` -- keep for now (Task 4 will handle)
   - `betas` is not passed anywhere else in RAC now (it was used for `shouldDisplayDualDropZone` and `AttachmentPickerWithMenuItems`, but APWMI already self-subscribes)... Actually, check: `betas` is NOT passed as a prop to `AttachmentPickerWithMenuItems` in the JSX. APWMI has its own `useOnyx(ONYXKEYS.BETAS)`. So `betas` in RAC is only used for `shouldDisplayDualDropZone` -- remove it.
   - `reportActions` is only used for `iouAction` which feeds into transaction resolution -- remove it.
   - `transaction` is only used for drop zone and receipt logic -- remove it (but `transactionID` feeds into `useAttachmentUploadValidation` -- keep `transactionID` computation for now, or see if AUUV can derive it itself in Task 4)
   - `isReportArchived` is passed to no child as prop in JSX -- remove (APWMI self-subscribes)
   - `isRestrictedToPreferredPolicy` same -- remove
   - `newParentReport` is passed to `useAttachmentUploadValidation` -- keep for now
   - `reportParticipantIDs` is passed to `AttachmentPickerWithMenuItems` -- keep for now

   **Net removals from root for this task:**
   - `[betas]` subscription
   - `[reportActions]` subscription
   - `[transaction]` subscription
   - `useReportIsArchived`
   - `usePreferredPolicy` (the `isRestrictedToPreferredPolicy` part)
   - All the transaction resolution computations (isTransactionThreadView, isExpensesReport, iouAction, linkedTransactionID, isSingleTransactionView, parentReportAction, canUserPerformWriteAction, canEditReceipt, shouldAddOrReplaceReceipt, hasReceipt, shouldDisplayDualDropZone)

2. Replace the drop zone JSX block (the `{shouldDisplayDualDropZone && (...)}` and `{!shouldDisplayDualDropZone && (...)}` blocks) with:

```tsx
<DropZoneArea
    reportID={reportID}
    report={report}
    reportTransactions={reportTransactions}
    transactionThreadReportID={transactionThreadReportID}
    onAttachmentDrop={handleAttachmentDrop}
    onReceiptDrop={onReceiptDropped}
    currentUserAccountID={currentUserPersonalDetails.accountID}
/>
```

3. Add the import:
```tsx
import DropZoneArea from './DropZoneArea';
```

4. Clean up unused imports: Remove imports for `DragAndDropConsumer`, `DropZoneUI`, `DualDropZone`, `getNonEmptyStringOnyxID`, `getLinkedTransactionID`, `getReportAction`, `isMoneyRequestAction`, `canEditFieldOfMoneyRequest`, `getParentReport`, `isChatRoom`, `isGroupChat`, `isInvoiceReport`, `isReportApproved`, `isReportTransactionThread`, `isSettled`, `temporary_getMoneyRequestOptions`, `getTransactionID`, `hasReceipt as hasReceiptTransactionUtils` -- but ONLY if they are not used elsewhere in the file. Some may still be used (e.g., `temporary_getMoneyRequestOptions` was only used for `shouldDisplayDualDropZone`).

- [ ] **Step 3: Verify**

Run:
```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
npx prettier --write src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx
npx eslint src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx --max-warnings=0
npm run typecheck-tsgo
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx
git commit -m "Extract DropZoneArea: isolate transaction resolution and drop zone subscriptions"
```

---

### Task 4: Convert useAttachmentUploadValidation to AttachmentUploadHandler component

**Files:**
- Create: `src/pages/inbox/report/ReportActionCompose/AttachmentUploadHandler.tsx`
- Modify: `src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx`
- Delete (or empty): `src/pages/inbox/report/ReportActionCompose/useAttachmentUploadValidation.ts`

**Context:** `useAttachmentUploadValidation` is a hook that returns JSX (`PDFValidationComponent`, `ErrorModal`). This blurs the hook/component boundary -- hooks should return data, components should return JSX. The hook receives 13 props from the parent, most of which it could subscribe to itself. Converting it to a component means:
1. It self-subscribes to what it needs (policy, policyCategories, ownerBillingGraceEndPeriod, etc.)
2. The parent passes only IDs and handlers
3. The JSX it returns renders naturally at its mount point

The hook also receives `shouldAddOrReplaceReceipt` and `transactionID` which were computed in the parent from the transaction resolution logic (now in DropZoneArea). The new component will derive these itself, or they can be passed as props since DropZoneArea already computes them.

**Design decision:** The `AttachmentUploadHandler` component will be renderless for its attachment validation logic but will render the `PDFValidationComponent` and `ErrorModal`. It communicates validation results upward through callback props (`onValidateAttachments`, `onReceiptDropped`).

However, this is a complex refactoring. The simpler approach: make `AttachmentUploadHandler` a component that:
- Self-subscribes to all its data needs
- Exposes `validateAttachments` and `onReceiptDropped` via an imperative handle (ref)
- Renders `PDFValidationComponent` and `ErrorModal` inline

Actually, the cleanest approach is to recognize that the parent needs `validateAttachments` and `onReceiptDropped` as functions to pass to other children (AttachmentPickerWithMenuItems needs `validateAttachments`, DropZoneArea needs both). This is coordination state that the parent legitimately owns. The solution:

1. Keep the validation logic as a hook (it correctly returns functions)
2. BUT make the hook self-subscribing (stop passing 13 props from the parent)
3. Move the JSX rendering into a separate component

Let me reconsider: the cleanest path is to make `useAttachmentUploadValidation` self-subscribing by having it take only IDs (reportID, report) and subscribe to everything internally. This aligns with CLEAN-REACT-PATTERNS-2.

- [ ] **Step 1: Refactor useAttachmentUploadValidation to be self-subscribing**

Modify `src/pages/inbox/report/ReportActionCompose/useAttachmentUploadValidation.ts` to accept only the minimal props it cannot derive itself:

New signature:
```tsx
type AttachmentUploadValidationProps = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    addAttachment: (file: FileObject | FileObject[]) => void;
    onAttachmentPreviewClose: () => void;
    exceededMaxLength: boolean | number | null;
    isAttachmentPreviewActive: boolean;
    setIsAttachmentPreviewActive: (isActive: boolean) => void;
};
```

The hook will internally subscribe to:
- `COLLECTION.POLICY/{report.policyID}` (was passed as `policy`)
- `COLLECTION.REPORT/{report.parentReportID}` (was passed as `newParentReport`)
- `CURRENT_DATE` (was passed as `currentDate`)
- `useCurrentUserPersonalDetails()` (was passed as `currentUserPersonalDetails`)

And derive `shouldAddOrReplaceReceipt` and `transactionID` internally by doing the same transaction resolution that DropZoneArea does (yes, this duplicates the computation, but each component owns exactly what it needs -- the subscriptions are per-key, not COLLECTION-level, so the cost is minimal).

Full implementation of the refactored hook:

```tsx
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useCallback, useContext, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {cleanFileObject, cleanFileObjectName, getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
import {getLinkedTransactionID, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    isReportTransactionThread,
    isSelfDM,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getTransactionID, hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import {initMoneyRequest, replaceReceipt, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type AttachmentUploadValidationProps = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    addAttachment: (file: FileObject | FileObject[]) => void;
    onAttachmentPreviewClose: () => void;
    exceededMaxLength: boolean | number | null;
    isAttachmentPreviewActive: boolean;
    setIsAttachmentPreviewActive: (isActive: boolean) => void;
};

function useAttachmentUploadValidation({
    reportID,
    report,
    addAttachment,
    onAttachmentPreviewClose,
    exceededMaxLength,
    isAttachmentPreviewActive,
    setIsAttachmentPreviewActive,
}: AttachmentUploadValidationProps) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isReportArchived = useReportIsArchived(report?.reportID);

    // Self-subscribe to data previously passed as props
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [ownerBillingGraceEndPeriod] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const personalPolicy = usePersonalPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    // Derive transaction resolution internally
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canEvict: false});
    const [reportTransactionsRaw] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_TRANSACTIONS}${report?.reportID}`);

    const isTransactionThreadView = isReportTransactionThread(report);
    const iouAction = reportActions ? Object.values(reportActions).find((action) => isMoneyRequestAction(action)) : null;
    const isExpensesReport = reportTransactionsRaw && reportTransactionsRaw.length > 1;
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;
    const transactionID = getTransactionID(report) ?? linkedTransactionID;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);

    const isSingleTransactionView = !!transaction && !!reportTransactionsRaw && reportTransactionsRaw.length === 1;
    const parentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt =
        canUserPerformWriteAction &&
        canEditFieldOfMoneyRequest({reportAction: parentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction}) &&
        !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;

    const hasOnlyPersonalPolicies = hasOnlyPersonalPoliciesUtil(allPolicies);

    const reportAttachmentsContext = useContext(AttachmentModalContext);
    const showAttachmentModalScreen = (file: FileObject | FileObject[], dataTransferItems?: DataTransferItem[]) => {
        reportAttachmentsContext.setCurrentAttachment<typeof SCREENS.REPORT_ADD_ATTACHMENT>({
            reportID,
            file,
            dataTransferItems,
            headerTitle: translate('reportActionCompose.sendAttachment'),
            onConfirm: addAttachment,
            onShow: () => setIsAttachmentPreviewActive(true),
            onClose: onAttachmentPreviewClose,
            shouldDisableSendButton: !!exceededMaxLength,
        });
        Navigation.navigate(ROUTES.REPORT_ADD_ATTACHMENT.getRoute(reportID));
    };

    const attachmentUploadType = useRef<'receipt' | 'attachment'>(undefined);
    const onFilesValidated = (files: FileObject[], dataTransferItems: DataTransferItem[]) => {
        if (files.length === 0) {
            return;
        }

        if (attachmentUploadType.current === 'attachment') {
            showAttachmentModalScreen(files, dataTransferItems);
            return;
        }

        if (shouldAddOrReplaceReceipt && transactionID) {
            const source = URL.createObjectURL(files.at(0) as Blob);
            replaceReceipt({transactionID, file: files.at(0) as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
            return;
        }

        const initialTransaction = initMoneyRequest({
            reportID,
            personalPolicy,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            report,
            parentReport: newParentReport,
            currentDate,
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies,
            draftTransactionIDs,
        });

        for (const [index, file] of files.entries()) {
            const source = URL.createObjectURL(file as Blob);
            const newTransaction =
                index === 0
                    ? (initialTransaction as Partial<OnyxTypes.Transaction>)
                    : buildOptimisticTransactionAndCreateDraft({
                          initialTransaction: initialTransaction as Partial<OnyxTypes.Transaction>,
                          currentUserPersonalDetails,
                          reportID,
                      });
            const newTransactionID = newTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
            setMoneyRequestReceipt(newTransactionID, source, file.name ?? '', true, file.type);
            setMoneyRequestParticipantsFromReport(newTransactionID, report, currentUserPersonalDetails.accountID);
        }
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                CONST.IOU.ACTION.CREATE,
                isSelfDM(report) ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT,
                CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                reportID,
            ),
        );
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(onFilesValidated);

    const validateAttachments = ({dragEvent, files}: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => {
        if (isAttachmentPreviewActive) {
            return;
        }

        let extractedFiles: FileObject[] = [];

        if (files) {
            extractedFiles = Array.isArray(files) ? files : [files];
        } else {
            if (!dragEvent) {
                return;
            }
            extractedFiles = getFilesFromClipboardEvent(dragEvent);
        }

        const dataTransferItems = Array.from(dragEvent?.dataTransfer?.items ?? []);
        if (extractedFiles.length === 0) {
            return;
        }

        const validIndices: number[] = [];
        const fileObjects = extractedFiles
            .map((item, index) => {
                const fileObject = cleanFileObject(item);
                const cleanedFileObject = cleanFileObjectName(fileObject);
                if (cleanedFileObject !== null) {
                    validIndices.push(index);
                }
                return cleanedFileObject;
            })
            .filter((fileObject) => fileObject !== null);

        if (!fileObjects.length) {
            return;
        }

        const filteredItems = dataTransferItems && validIndices.length > 0 ? validIndices.map((index) => dataTransferItems.at(index) ?? ({} as DataTransferItem)) : undefined;

        attachmentUploadType.current = 'attachment';
        validateFiles(fileObjects, filteredItems, {isValidatingReceipts: false});
    };

    const onReceiptDropped = (e: DragEvent) => {
        if (policy && shouldRestrictUserBillableActions(policy.id, ownerBillingGraceEndPeriod, userBillingGraceEndPeriods)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        const files = getFilesFromClipboardEvent(e);
        const items = Array.from(e.dataTransfer?.items ?? []);

        if (shouldAddOrReplaceReceipt && transactionID) {
            const file = files.at(0);
            if (!file) {
                return;
            }
            attachmentUploadType.current = 'receipt';
            validateFiles([file], items);
        }

        attachmentUploadType.current = 'receipt';
        validateFiles(files, items, {isValidatingReceipts: true});
    };

    return {
        validateAttachments,
        onReceiptDropped,
        PDFValidationComponent,
        ErrorModal,
    };
}

export default useAttachmentUploadValidation;
```

- [ ] **Step 2: Update ReportActionCompose to pass minimal props to refactored hook**

In `ReportActionCompose.tsx`, update the `useAttachmentUploadValidation` call to pass only the minimal props:

```tsx
const {validateAttachments, onReceiptDropped, PDFValidationComponent, ErrorModal} = useAttachmentUploadValidation({
    reportID,
    report,
    addAttachment,
    onAttachmentPreviewClose,
    exceededMaxLength,
    isAttachmentPreviewActive,
    setIsAttachmentPreviewActive,
});
```

Remove from ReportActionCompose the subscriptions/values that are now internal to the hook:
- `const [policy] = useOnyx(...)` -- if not used elsewhere. Check: `policy` was used for `shouldDisplayDualDropZone` (now in DropZoneArea) and `useAttachmentUploadValidation` (now self-subscribing). If nothing else uses it, remove.
- `const [newParentReport] = useOnyx(...)` -- only used by useAttachmentUploadValidation. Remove.
- `const [currentDate] = useOnyx(...)` -- only used by useAttachmentUploadValidation. Remove.
- `const personalDetail` -- already removed in Task 1 (the duplicate). The remaining `currentUserPersonalDetails` is still needed for `submitForm` and `AttachmentPickerWithMenuItems` prop.

After this step, also check if `reportParticipantIDs` is still needed. It was used for `shouldDisplayDualDropZone` (now in DropZoneArea) and as a prop to `AttachmentPickerWithMenuItems`. If APWMI still receives it, keep it. Check the APWMI props in the JSX.

Looking at the JSX, APWMI receives `reportParticipantIDs={reportParticipantIDs}`. APWMI already self-subscribes to policy/betas/etc but receives `reportParticipantIDs` as a prop because it uses it for `temporary_getMoneyRequestOptions`. APWMI could derive this itself from report.participants and currentUserPersonalDetails.accountID. But that's a further cleanup (APWMI self-subscribing more). For this task, keep `reportParticipantIDs` in RAC.

- [ ] **Step 3: Update DropZoneArea to receive onReceiptDrop from parent**

Verify that DropZoneArea (created in Task 3) correctly receives `onReceiptDrop` as a prop and the parent passes `onReceiptDropped` from the hook.

In the parent JSX:
```tsx
<DropZoneArea
    reportID={reportID}
    report={report}
    reportTransactions={reportTransactions}
    transactionThreadReportID={transactionThreadReportID}
    onAttachmentDrop={handleAttachmentDrop}
    onReceiptDrop={onReceiptDropped}
    currentUserAccountID={currentUserPersonalDetails.accountID}
/>
```

- [ ] **Step 4: Verify**

Run:
```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
npx prettier --write src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/useAttachmentUploadValidation.ts src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx
npx eslint src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/useAttachmentUploadValidation.ts src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx --max-warnings=0
npm run typecheck-tsgo
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx src/pages/inbox/report/ReportActionCompose/useAttachmentUploadValidation.ts src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx
git commit -m "Make useAttachmentUploadValidation self-subscribing, remove proxy props from parent"
```

---

### Task 5: Remove remaining duplicate subscriptions from root

**Files:**
- Modify: `src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx`

**Context:** After Tasks 1-4, review what subscriptions remain at the ReportActionCompose root level and eliminate any that are not directly consumed by the orchestrator's own logic.

- [ ] **Step 1: Audit remaining subscriptions**

Run this to see what useOnyx/useHook calls remain:
```bash
grep -n "useOnyx\|useCurrentUserPersonalDetails\|useReportIsArchived\|usePreferredPolicy\|useNetwork\|usePersonalDetails\|useAncestors" src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx
```

Expected remaining subscriptions after Tasks 1-4:
- `useCurrentUserPersonalDetails` -- needed for submitForm (accountID, timezone) and APWMI prop
- `usePersonalDetails` -- needed for `shouldShowReportRecipientLocalTime` and `reportRecipient`
- `useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE)` -- needed for isBlockedFromConcierge
- `useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT)` -- needed for shouldFocusComposerOnScreenFocus
- `useOnyx(ONYXKEYS.MODAL)` -- needed for initial focus state only (useState initializer)
- `useOnyx(COLLECTION.REPORT_DRAFT_COMMENT/{reportID})` -- needed for shouldFocusComposerOnScreenFocus and isCommentEmpty
- `useOnyx(COLLECTION.REPORT/{transactionThreadReportID})` -- needed for submitForm
- `useAncestors` -- needed for submitForm
- `useNetwork` -- needed for offline indicator styling
- Various UI hooks (useTheme, useThemeStyles, useLocalize, etc.)

- [ ] **Step 2: Address MODAL subscription**

`useOnyx(ONYXKEYS.MODAL)` on line 164 is named `initialModalState` and is only used in the `useState` initializer for `isFocused` (line 178-179). After the initial render, this subscription continues firing on every modal open/close for no reason -- the value is only read once.

Since this is only needed at mount time, we can use `initWithStoredValues: false` is not the right pattern here. The correct approach: keep the subscription but note that it fires rarely (modal open/close) and the component needs to know if a modal is visible to avoid auto-focusing. Actually, looking more carefully at the code, `initialModalState` is ONLY used in the `useState` initializer -- it is never read again after mount. This means the subscription is pure waste after initialization.

The fix: use `useOnyx` with the subscription, but recognize that React Compiler will not re-render the component when only the `initialModalState` changes IF the value is not used in the render output. Actually, `initialModalState` IS used in the useState initializer which only runs once, but the variable itself is in scope and could be captured by the compiler. The cleanest fix: rename and note that this is an initialization-only read. The compiler will handle memoization correctly -- if the value changes but nothing in the render path depends on it, no re-render propagates.

Actually, the real issue is simpler: `useOnyx` will trigger a re-render whenever MODAL changes, regardless of whether the value is used in the output. The only way to avoid this is to NOT subscribe. We could replace this with reading from Onyx directly in the initializer. But that's a micro-optimization -- modal changes are infrequent. Leave it for now. Note it as a follow-up.

- [ ] **Step 3: Clean up unused imports**

After all removals, scan the import block for anything no longer used:
```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
npx eslint src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx --max-warnings=0
```

ESLint's `no-unused-vars` and `no-unused-imports` rules will flag unused imports. Fix them.

- [ ] **Step 4: Verify the final state**

Run:
```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
npx prettier --write src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx
npx eslint src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx --max-warnings=0
npm run typecheck-tsgo
```

- [ ] **Step 5: Run React Compiler compliance check**

```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2
check-compiler.sh src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx
```

Expected: The file should now compile successfully with React Compiler (no eslint-disable react-hooks, no manual memoization).

Also check the new files:
```bash
check-compiler.sh src/pages/inbox/report/ReportActionCompose/EmojiPickerCleanupHandler.tsx
check-compiler.sh src/pages/inbox/report/ReportActionCompose/DropZoneArea.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/inbox/report/ReportActionCompose/ReportActionCompose.tsx
git commit -m "Clean up remaining imports and verify compiler compliance"
```

---

## Expected Outcome

### Before (ReportActionCompose root)

| Metric | Value |
|--------|-------|
| Lines | ~730 |
| useOnyx subscriptions at root | ~14 direct |
| Hook-based subscriptions at root | ~7 |
| Total subscriptions at root | ~21 |
| COLLECTION-level subscriptions | 3 (via useAncestors) |
| Duplicate subscriptions (parent + child) | 7 |
| React Compiler errors | 2 (eslint-disable) |
| Manual memoization instances | ~20 (useCallback/useMemo/memo) |

### After

| Metric | Value |
|--------|-------|
| Lines | ~400-450 (estimated) |
| useOnyx subscriptions at root | ~5 (BLOCKED_FROM_CONCIERGE, SHOULD_SHOW_COMPOSE_INPUT, MODAL, DRAFT_COMMENT, transactionThreadReport) |
| Hook-based subscriptions at root | ~5 (currentUserPersonalDetails, personalDetails, useNetwork, useAncestors, useIsInSidePanel) |
| Total subscriptions at root | ~10 |
| COLLECTION-level subscriptions | 3 (useAncestors -- unchanged, follow-up) |
| Duplicate subscriptions eliminated | policy, betas, preferredPolicy, reportIsArchived, currentDate, newParentReport, currentUserPersonalDetails(x1) |
| React Compiler errors | 0 |
| Manual memoization instances | 0 |

### Follow-up work (not in this PR)

1. **Move `useAncestors` to action layer** -- The 3 COLLECTION subscriptions are the heaviest remaining cost. They should be resolved at action-time using `Onyx.connect` inside the Report action, not in the render tree. This affects 14 call sites and is a separate cross-cutting PR.
2. **Make AttachmentPickerWithMenuItems fully self-subscribing** -- It still receives `currentUserPersonalDetails` and `reportParticipantIDs` as props that it could derive itself.
3. **Push `submitForm` into a dedicated handler** -- The submit logic (attachment path vs text path, telemetry, scrollOffset check) could be a focused hook, further slimming the orchestrator.
