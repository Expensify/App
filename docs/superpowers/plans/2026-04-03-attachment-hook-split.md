# Attachment Hook Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `useAttachmentUploadValidation` from ComposerProvider, split into `useAttachmentPicker` (lightweight) and `useReceiptDrop` (heavy), each called by its consumer directly.

**Architecture:** Split the mixed-concern hook into two focused hooks. Each consumer calls its own hook and renders its own validation UI. Provider sheds ~10 Onyx subscriptions and removes unstable function references from context. `addAttachment` replaced by `clearComposer` in ActionsContext + inline `attachmentFileRef` write.

**Tech Stack:** React hooks, React Native Onyx, `useFilesValidation`

**Spec:** `docs/superpowers/specs/2026-04-03-attachment-hook-split-design.md`

---

All files under `src/pages/inbox/report/ReportActionCompose/` unless noted otherwise.

### Task 1: Create `useAttachmentPicker` hook

**Files:**
- Create: `useAttachmentPicker.ts`

- [ ] **Step 1: Create the hook**

This hook handles file picking and paste validation. It opens the attachment modal for preview. No Onyx subscriptions.

It extracts the file-cleaning logic and `showAttachmentModalScreen` from the old `useAttachmentUploadValidation`, plus the `validateAttachments` wrapper. The `onFilesValidated` callback always opens the attachment modal (no receipt branching).

```ts
import {useContext, useRef, useState} from 'react';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import {cleanFileObject, cleanFileObjectName, getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@navigation/Navigation';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import {useComposerActions, useComposerMeta, useComposerSendState} from './ComposerContext';

function useAttachmentPicker(reportID: string) {
    const {translate} = useLocalize();
    const {exceededMaxLength} = useComposerSendState();
    const {clearComposer} = useComposerActions();
    const {attachmentFileRef, suggestionsRef} = useComposerMeta();

    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const reportAttachmentsContext = useContext(AttachmentModalContext);

    const addAttachment = (file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;
        clearComposer();
    };

    const onAttachmentPreviewClose = () => {
        if (suggestionsRef.current) {
            suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
        }
        setIsAttachmentPreviewActive(false);
        ComposerFocusManager.setReadyToFocus();
    };

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

    const onFilesValidated = (files: FileObject[], dataTransferItems: DataTransferItem[]) => {
        if (files.length === 0) {
            return;
        }
        showAttachmentModalScreen(files, dataTransferItems);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(onFilesValidated);

    const pickAttachments = ({dragEvent, files}: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => {
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

        validateFiles(fileObjects, filteredItems, {isValidatingReceipts: false});
    };

    return {pickAttachments, PDFValidationComponent, ErrorModal};
}

export default useAttachmentPicker;
```

- [ ] **Step 2: Commit**

```bash
git add useAttachmentPicker.ts
git commit -m "Create useAttachmentPicker — lightweight file validation hook"
```

---

### Task 2: Create `useReceiptDrop` hook

**Files:**
- Create: `useReceiptDrop.ts`

- [ ] **Step 1: Create the hook**

This hook handles receipt drag-and-drop. It owns all the Onyx subscriptions for receipt creation (`policy`, `policyCategories`, `newParentReport`, `currentDate`, etc.). Only used by ComposerDropZone.

```ts
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import {cleanFileObject, cleanFileObjectName, getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
import {isSelfDM} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import {initMoneyRequest, replaceReceipt, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import {useComposerActions, useComposerMeta} from './ComposerContext';

type UseReceiptDropParams = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    shouldAddOrReplaceReceipt: boolean;
    transactionID: string | undefined;
};

function useReceiptDrop({reportID, report, shouldAddOrReplaceReceipt, transactionID}: UseReceiptDropParams) {
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {clearComposer} = useComposerActions();
    const {attachmentFileRef} = useComposerMeta();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const personalPolicy = usePersonalPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const hasOnlyPersonalPolicies = hasOnlyPersonalPoliciesUtil(allPolicies);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const onFilesValidated = (files: FileObject[], _dataTransferItems: DataTransferItem[]) => {
        if (files.length === 0) {
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

    const onReceiptDropped = (e: DragEvent) => {
        if (policy && shouldRestrictUserBillableActions(policy.id, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
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

            validateFiles([file], items);
            return;
        }

        validateFiles(files, items, {isValidatingReceipts: true});
    };

    const pickAttachmentsDrop = ({dragEvent}: {dragEvent: DragEvent}) => {
        if (isAttachmentPreviewActive) {
            return;
        }

        const extractedFiles = getFilesFromClipboardEvent(dragEvent);
        const dataTransferItems = Array.from(dragEvent.dataTransfer?.items ?? []);
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

        const filteredItems = validIndices.length > 0 ? validIndices.map((index) => dataTransferItems.at(index) ?? ({} as DataTransferItem)) : undefined;

        validateFiles(fileObjects, filteredItems, {isValidatingReceipts: false});
    };

    return {onReceiptDropped, pickAttachmentsDrop, PDFValidationComponent, ErrorModal};
}

export default useReceiptDrop;
```

Note: `pickAttachmentsDrop` handles the attachment drop path (non-receipt files dropped onto the composer). DropZone needs this because it handles both attachment drops and receipt drops. The receipt path goes through `onReceiptDropped`, the attachment path through `pickAttachmentsDrop`.

- [ ] **Step 2: Commit**

```bash
git add useReceiptDrop.ts
git commit -m "Create useReceiptDrop — receipt creation hook with Onyx subscriptions"
```

---

### Task 3: Update `ComposerContext.ts` — remove attachment types from contexts

**Files:**
- Modify: `ComposerContext.ts`

- [ ] **Step 1: Update types**

Remove from `ComposerSendState`:
```ts
validateAttachments: (args: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => void;
onReceiptDropped: (event: DragEvent) => void;
```

Remove from `ComposerActions`:
```ts
setIsAttachmentPreviewActive: (isActive: boolean) => void;
addAttachment: (file: FileObject | FileObject[]) => void;
onAttachmentPreviewClose: () => void;
```

Add to `ComposerActions`:
```ts
clearComposer: () => void;
```

Update `defaultSendState` — remove `validateAttachments: noop` and `onReceiptDropped: noop`.

Update `defaultActions` — remove `setIsAttachmentPreviewActive: noop`, `addAttachment: noop`, `onAttachmentPreviewClose: noop`. Add `clearComposer: noop`.

Remove `FileObject` import if no longer needed (check — `attachmentFileRef` in `ComposerMeta` still uses it, so keep it).

- [ ] **Step 2: Commit**

```bash
git add ComposerContext.ts
git commit -m "Remove attachment types from contexts, add clearComposer"
```

---

### Task 4: Update `ComposerProvider.tsx` — remove hook and add `clearComposer`

**Files:**
- Modify: `ComposerProvider.tsx`

- [ ] **Step 1: Remove attachment-related code**

Remove these imports:
```ts
import ComposerFocusManager from '@libs/ComposerFocusManager';
import type {FileObject} from '@src/types/utils/Attachment';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';
import useShouldAddOrReplaceReceipt from './useShouldAddOrReplaceReceipt';
```

Remove from the function body:
- `const {shouldAddOrReplaceReceipt, transactionID} = useShouldAddOrReplaceReceipt(reportID, isOffline);`
- `const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);`
- The entire `addAttachment` function
- The entire `updateShouldShowSuggestionMenuToFalse` function
- The entire `onAttachmentPreviewClose` function
- The entire `useAttachmentUploadValidation` call and destructuring

Add `clearComposer` function (uses `composerRefShared`, which stays in the provider):
```ts
const clearComposer = () => {
    const clearWorklet = composerRefShared.get().clearWorklet;
    if (!clearWorklet) {
        throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
    }
    scheduleOnUI(clearWorklet);
};
```

Update `composerSendState` — remove `validateAttachments` and `onReceiptDropped`:
```ts
const composerSendState = {
    isEmpty,
    isSendDisabled,
    exceededMaxLength,
    hasExceededMaxTaskTitleLength,
    isBlockedFromConcierge,
};
```

Update `composerActions` — remove `setIsAttachmentPreviewActive`, `addAttachment`, `onAttachmentPreviewClose`. Add `clearComposer`:
```ts
const composerActions = {
    setValue,
    setIsFocused,
    setMenuVisibility,
    setIsFullComposerAvailable,
    setComposerRef,
    clearComposer,
    focus,
    onBlur,
    onFocus,
    onAddActionPressed,
    onItemSelected,
    onTriggerAttachmentPicker,
};
```

Update JSX — remove `{PDFValidationComponent}` and `{ErrorModal}` from the return:
```tsx
return (
    <ComposerTextContext.Provider value={text}>
        <ComposerStateContext.Provider value={composerState}>
            <ComposerSendStateContext.Provider value={composerSendState}>
                <ComposerActionsContext.Provider value={composerActions}>
                    <ComposerSendActionsContext.Provider value={composerSendActions}>
                        <ComposerMetaContext.Provider value={composerMeta}>{children}</ComposerMetaContext.Provider>
                    </ComposerSendActionsContext.Provider>
                </ComposerActionsContext.Provider>
            </ComposerSendStateContext.Provider>
        </ComposerStateContext.Provider>
    </ComposerTextContext.Provider>
);
```

Remove `{isOffline}` from `useNetwork()` if it's no longer used (it was only passed to `useShouldAddOrReplaceReceipt`). Check if `useNetwork` is still needed — if not, remove the call and import.

- [ ] **Step 2: Commit**

```bash
git add ComposerProvider.tsx
git commit -m "Remove attachment hook from provider, add clearComposer"
```

---

### Task 5: Update `ComposerActionMenu.tsx` — call `useAttachmentPicker` directly

**Files:**
- Modify: `ComposerActionMenu.tsx`

- [ ] **Step 1: Switch to local hook**

Remove `useComposerSendState` from context import (ActionMenu no longer reads `validateAttachments` from it). Keep `useComposerState` for `isMenuVisible`/`isFullComposerAvailable`.

Add self-subscription for `isBlockedFromConcierge` and `exceededMaxLength` (these were in SendState before, but ActionMenu still needs them):
```ts
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import useAttachmentPicker from './useAttachmentPicker';
```

Replace:
```ts
const {isBlockedFromConcierge, exceededMaxLength, validateAttachments} = useComposerSendState();
```
with:
```ts
const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const isBlockedFromConcierge = chatIncludesConcierge({participants: report?.participants}) && isBlockedFromConciergeUserAction(blockedFromConcierge);
const {pickAttachments, PDFValidationComponent, ErrorModal} = useAttachmentPicker(reportID);
```

Note: `exceededMaxLength` was used for `shouldDisableAttachmentItem`. It's now read inside `useAttachmentPicker` internally. For the `shouldDisableAttachmentItem` prop on `AttachmentPickerWithMenuItems`, ActionMenu needs it directly. Add a self-subscription:
```ts
// exceededMaxLength is still available from useComposerSendState for the disable prop
const {exceededMaxLength} = useComposerSendState();
```

Actually, keep `useComposerSendState` but only destructure `exceededMaxLength`:
```ts
const {exceededMaxLength} = useComposerSendState();
```

Replace `onAttachmentPicked`:
```ts
onAttachmentPicked={(files) => pickAttachments({files})}
```

Render validation UI after `AttachmentPickerWithMenuItems`:
```tsx
return (
    <>
        <AttachmentPickerWithMenuItems
            ...
        />
        {PDFValidationComponent}
        {ErrorModal}
    </>
);
```

- [ ] **Step 2: Commit**

```bash
git add ComposerActionMenu.tsx
git commit -m "ComposerActionMenu calls useAttachmentPicker directly"
```

---

### Task 6: Update `ComposerInputWrapper.tsx` — call `useAttachmentPicker` for paste

**Files:**
- Modify: `ComposerInputWrapper.tsx`

- [ ] **Step 1: Switch to local hook**

Remove `validateAttachments` from `useComposerSendState`:
```ts
const {isBlockedFromConcierge} = useComposerSendState();
```

Add:
```ts
import useAttachmentPicker from './useAttachmentPicker';
```

Call the hook:
```ts
const {pickAttachments, PDFValidationComponent, ErrorModal} = useAttachmentPicker(reportID);
```

Replace:
```ts
onPasteFile={(files) => validateAttachments({files})}
```
with:
```ts
onPasteFile={(files) => pickAttachments({files})}
```

Wrap the return in a fragment to include validation UI:
```tsx
return (
    <>
        <ComposerWithSuggestions
            ...
        />
        {PDFValidationComponent}
        {ErrorModal}
    </>
);
```

- [ ] **Step 2: Commit**

```bash
git add ComposerInputWrapper.tsx
git commit -m "ComposerInputWrapper calls useAttachmentPicker for paste"
```

---

### Task 7: Update `ComposerDropZone.tsx` — call `useReceiptDrop` directly

**Files:**
- Modify: `ComposerDropZone.tsx`

- [ ] **Step 1: Switch to local hook**

Remove:
```ts
import {useComposerSendState} from './ComposerContext';
```

Add:
```ts
import useReceiptDrop from './useReceiptDrop';
```

Replace:
```ts
const {validateAttachments, onReceiptDropped} = useComposerSendState();
```
with:
```ts
const {onReceiptDropped, pickAttachmentsDrop, PDFValidationComponent, ErrorModal} = useReceiptDrop({
    reportID,
    report,
    shouldAddOrReplaceReceipt,
    transactionID,
});
```

Replace:
```ts
const onAttachmentDrop = (dragEvent: DragEvent) => validateAttachments({dragEvent});
```
with:
```ts
const onAttachmentDrop = (dragEvent: DragEvent) => pickAttachmentsDrop({dragEvent});
```

Render validation UI. Wrap the early return and main return to include it:

For the SimpleDropZone path:
```tsx
return (
    <>
        <SimpleDropZone onAttachmentDrop={onAttachmentDrop}>{children}</SimpleDropZone>
        {PDFValidationComponent}
        {ErrorModal}
    </>
);
```

For the RichDropZone path:
```tsx
return (
    <>
        <RichDropZone ...>{children}</RichDropZone>
        {PDFValidationComponent}
        {ErrorModal}
    </>
);
```

- [ ] **Step 2: Commit**

```bash
git add ComposerDropZone.tsx
git commit -m "ComposerDropZone calls useReceiptDrop directly"
```

---

### Task 8: Delete `useAttachmentUploadValidation.ts`

**Files:**
- Delete: `useAttachmentUploadValidation.ts`

- [ ] **Step 1: Delete the file**

```bash
git rm useAttachmentUploadValidation.ts
```

- [ ] **Step 2: Commit**

```bash
git commit -m "Delete useAttachmentUploadValidation — replaced by useAttachmentPicker + useReceiptDrop"
```

---

### Task 9: Verification

- [ ] **Step 1: TypeScript check**

```bash
npm run typecheck-tsgo
```

Fix any type errors. Common issues:
- Old references to `validateAttachments` / `onReceiptDropped` / `addAttachment` / `onAttachmentPreviewClose` in context types
- Missing `clearComposer` in consumer destructuring

- [ ] **Step 2: ESLint**

```bash
npx eslint src/pages/inbox/report/ReportActionCompose/ --max-warnings=0
```

- [ ] **Step 3: Prettier**

```bash
npx prettier --write src/pages/inbox/report/ReportActionCompose/
```

- [ ] **Step 4: Commit fixes**

```bash
git add -A && git commit -m "Fix typecheck, lint, prettier"
```
