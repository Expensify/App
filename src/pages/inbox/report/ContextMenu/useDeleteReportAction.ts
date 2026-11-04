/**
 * Owns the Onyx reads and the delete logic for the report action delete confirmation. PopoverReportActionContextMenu
 * stays mounted for the whole app, so it calls this only from a component that is mounted while the confirmation is in use.
 */
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useAncestors from '@hooks/useAncestors';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {deleteTrackExpense} from '@libs/actions/IOU/TrackExpense';
import {deleteAppReport, deleteReportComment} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage, isMoneyRequestAction, isReportPreviewAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import {getOriginalTransactionWithSplitInfo} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {DeviceEventEmitter} from 'react-native';

type UseDeleteReportActionParams = {
    reportID: string | undefined;

    reportAction: ReportAction | null;

    /** Called before the delete starts */
    onConfirm: () => void;

    /** Called when the delete is done and the confirmation should close */
    onClose: () => void;

    /** Runs a comment delete once the confirmation is fully hidden */
    deleteAfterModalHide: (deleteComment: () => void) => void;
};

/** Returns the handler that deletes the report action when the user confirms */
function useDeleteReportAction({reportID, reportAction, onConfirm, onClose, deleteAfterModalHide}: UseDeleteReportActionParams) {
    const {isOffline} = useNetwork();
    const isReportArchived = useReportIsArchived(reportID);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const originalReportID = getOriginalReportID(reportID, reportAction, reportActions, isOffline);
    const [originalReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const {iouReport, chatReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(reportAction);
    const {email, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const transactionIDs: string[] = [];
    if (isMoneyRequestAction(reportAction)) {
        const originalMessage = getOriginalMessage(reportAction);
        if (originalMessage && 'IOUTransactionID' in originalMessage && !!originalMessage.IOUTransactionID) {
            transactionIDs.push(originalMessage.IOUTransactionID);
        }
    }

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionIDs);
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0) ?? ''}`);
    const [iouOriginalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransaction?.comment?.originalTransactionID)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);
    const [childReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReport?.reportID}`);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const childParentReportAction = useParentReportAction(childReport);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [iouPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const iouReportTransactionsCollection = useReportTransactionsCollection(iouReport?.reportID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const {currentSearchHash} = useSearchQueryContext();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {deleteTransactions} = useDeleteTransactions({
        report,
        reportActions: reportAction ? [reportAction] : [],
        policy,
    });

    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const ancestors = useAncestors(originalReport);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(originalReport?.iouReportID);

    const deleteReportActionAndClose = () => {
        onConfirm();
        if (isMoneyRequestAction(reportAction)) {
            const originalMessage = getOriginalMessage(reportAction);
            const {isExpenseSplit: isSelfDMExpenseSplit} = getOriginalTransactionWithSplitInfo(iouTransaction, iouOriginalTransaction);
            if (isTrackExpenseAction(reportAction) && !isSelfDMExpenseSplit) {
                deleteTrackExpense({
                    chatReportID: reportID,
                    chatReport: report,
                    chatReportActions: reportActions,
                    transactionThreadReportActions: childReportActions,
                    transactionID: originalMessage?.IOUTransactionID,
                    reportAction,
                    iouReport,
                    iouReportTransactions: Object.values(iouReportTransactionsCollection),
                    chatIOUReport: chatReport,
                    transactions: duplicateTransactions,
                    violations: duplicateTransactionViolations,
                    isSingleTransactionView: undefined,
                    isChatReportArchived: isReportArchived,
                    isChatIOUReportArchived,
                    allTransactionViolationsParam: allTransactionViolations,
                    currentUserAccountID,
                    currentUserEmail: email ?? '',
                    policy: iouPolicy,
                    getCurrencyDecimals,
                });
            } else if (originalMessage?.IOUTransactionID) {
                const deleteResult = deleteTransactions([originalMessage.IOUTransactionID], duplicateTransactions, duplicateTransactionViolations, undefined);

                if (deleteResult.action === 'redirected') {
                    onClose();
                    return;
                }
            }
        } else if (isReportPreviewAction(reportAction)) {
            deleteAppReport({
                report: childReport,
                reportActions: childReportActions,
                parentReportAction: childParentReportAction,
                selfDMReport,
                currentUserEmailParam: email ?? '',
                currentUserAccountIDParam: currentUserAccountID,
                reportTransactions,
                allTransactionViolations,
                bankAccountList,
                delegateAccountID,
                hash: currentSearchHash,
            });
        } else if (reportAction) {
            deleteAfterModalHide(() => {
                deleteReportComment({
                    report,
                    reportAction,
                    originalReportActions,
                    reportActions,
                    ancestors,
                    isReportArchived,
                    isOriginalReportArchived,
                    currentEmail: email ?? '',
                    isOffline,
                    currentUserAccountID,
                    visibleReportActionsData: visibleReportActionsData ?? undefined,
                });
            });
        }

        DeviceEventEmitter.emit(`deletedReportAction_${reportID}`, reportAction?.reportActionID);
        onClose();
    };

    return deleteReportActionAndClose;
}

export default useDeleteReportAction;
export type {UseDeleteReportActionParams};
