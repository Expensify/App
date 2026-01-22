## Proposal

### Please re-state the problem that we are trying to solve in this issue.

When users are on the Search/Reports page with filters applied and select reports to export, a modal appears with the message "Export in progress - Concierge will send you the file shortly." This modal only has a confirm button. After confirming, users must manually navigate away from the Reports page to Concierge chat to download the exported file. This navigation causes users to lose their current filter context and workflow state.

### What is the root cause of that problem?

The export modal is displayed in `src/pages/Search/SearchPage.tsx` within the `beginExportWithTemplate` callback (lines 259-294):

```typescript
const beginExportWithTemplate = useCallback(
    async (templateName: string, templateType: string, policyID: string | undefined) => {
        // ... export queuing logic ...

        const result = await showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        clearSelectedTransactions(undefined, true);
    },
    [queryJSON, selectedTransactionsKeys, areAllMatchingItemsSelected, selectedTransactionReportIDs, showConfirmModal, translate, clearSelectedTransactions],
);
```

After showing the confirmation modal telling users Concierge will send the file, the code simply clears the selected transactions and does nothing else. There's no way to access Concierge without manually navigating away from the Reports page.

The app already has Side Panel functionality that can show Concierge without navigation. The Side Panel renders Concierge by default using the `conciergeReportID` from the `SidePanelContextProvider`.

### What changes do you think we should make in order to solve the problem?

After the export confirmation modal is dismissed, automatically open the Side Panel on desktop to show Concierge. Users can then receive and download the file without leaving the Reports page or losing their filters.

In `src/pages/Search/SearchPage.tsx`, modify the `beginExportWithTemplate` callback:

```typescript
// At the top of the file, add import:
import useSidePanel from '@hooks/useSidePanel';

// Inside the SearchPage component, get the openSidePanel function:
const {openSidePanel} = useSidePanel();

// Modify beginExportWithTemplate callback:
const beginExportWithTemplate = useCallback(
    async (templateName: string, templateType: string, policyID: string | undefined) => {
        // ... existing export queuing logic ...

        const result = await showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        clearSelectedTransactions(undefined, true);

        // Open Concierge in Side Panel on desktop only
        // shouldUseNarrowLayout is false on desktop
        if (!shouldUseNarrowLayout) {
            openSidePanel();
        }
    },
    [queryJSON, selectedTransactionsKeys, areAllMatchingItemsSelected, selectedTransactionReportIDs, showConfirmModal, translate, clearSelectedTransactions, shouldUseNarrowLayout, openSidePanel],
);
```

The same pattern should be applied to `MoneyReportHeader.tsx` and `MoneyRequestReportActionsList.tsx` which also have `beginExportWithTemplate` implementations.

To test, go to the Search page and apply filters like date range or status. Select some expenses/reports and click Export, then confirm the modal. On desktop, the Side Panel should open with Concierge while the filters remain intact. On mobile, nothing should change. Wait for Concierge to send the file and verify it can be downloaded from the Side Panel without the original filters being lost.

### What alternative solutions did you explore? (Optional)

Navigating to Concierge after the modal would defeat the purpose since users would still lose their context. Adding a button to the modal to go to Concierge is more intrusive and requires extra user action. Showing Concierge in a popup would require new modal infrastructure. Using the Side Panel works because it's already designed for this use case.
