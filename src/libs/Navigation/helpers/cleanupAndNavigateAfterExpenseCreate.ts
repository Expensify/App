import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import type {Report, ReportAction} from '@src/types/onyx';
import navigateAfterExpenseCreate from './navigateAfterExpenseCreate';

type CleanupAndNavigateAfterExpenseCreateParams = {
    report: OnyxEntry<Report>;
    draftTransactionIDs: string[] | undefined;
    transactionID: string | undefined;
    isFromGlobalCreate: boolean | undefined;
    hasMultipleTransactions: boolean;
    backToReport?: string;
    optimisticChatReportID?: string;
    isInvoice?: boolean;
    /** Set for the move-from-track flow so the linked child report screen is popped before navigating. */
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

/**
 * Post-expense-creation cleanup and navigation. Call from UI after `requestMoney`/`trackExpense`/`createDistanceRequest`/`submitPerDiemExpense` returns.
 */
function cleanupAndNavigateAfterExpenseCreate({
    report,
    draftTransactionIDs,
    transactionID,
    isFromGlobalCreate,
    hasMultipleTransactions,
    backToReport,
    optimisticChatReportID,
    isInvoice,
    linkedTrackedExpenseReportAction,
}: CleanupAndNavigateAfterExpenseCreateParams) {
    // Defer cleanup until after modal-dismiss animation so it doesn't block the JS thread.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransactionsByIDs(draftTransactionIDs));

    if (linkedTrackedExpenseReportAction?.childReportID) {
        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }

    const isExpenseReport = isMoneyRequestReport(report);
    const linkedChatReport = isExpenseReport ? getReportOrDraftReport(report?.chatReportID) : undefined;
    const activeReportID =
        isExpenseReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : (linkedChatReport?.reportID ?? report?.reportID ?? optimisticChatReportID);

    navigateAfterExpenseCreate({
        activeReportID: backToReport ?? activeReportID,
        transactionID,
        isFromGlobalCreate,
        isInvoice,
        hasMultipleTransactions,
    });
}

export default cleanupAndNavigateAfterExpenseCreate;
