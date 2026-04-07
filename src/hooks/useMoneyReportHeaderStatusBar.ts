import {getArchiveReason} from '@selectors/Report';
import type {ValueOf} from 'type-fest';
import {isPersonalCard} from '@libs/CardUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    hasDuplicateTransactions,
    hasReceipt,
    isExpensifyCardTransaction,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isScanning,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useReportIsArchived from './useReportIsArchived';
import useReportTransactionsCollection from './useReportTransactionsCollection';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';
import useTransactionViolations from './useTransactionViolations';

type StatusBarType = ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE>;

type StatusBarResult = {
    shouldShowStatusBar: boolean;
    statusBarType: StatusBarType | undefined;
};

function useMoneyReportHeaderStatusBar(reportID: string | undefined, chatReportID: string | undefined): StatusBarResult {
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportID);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const requestParentReportAction = (() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
    })();
    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const transactionViolations = useTransactionViolations(iouTransactionID);

    const {transactions: reportTransactionsMap, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);

    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason});

    const hasScanningReceipt = transactions.filter((t) => hasReceipt(t)).some(isScanning);
    const hasOnlyPendingTransactions = transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactions, violations, email ?? '', accountID, moneyRequestReport, policy);
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactions, moneyRequestReport, policy, violations, email ?? '', accountID);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID, transactions);
    const isPayAtEndExpense = isPayAtEndExpenseTransactionUtils(transaction);
    const hasDuplicates = hasDuplicateTransactions(email ?? '', accountID, moneyRequestReport, policy, allTransactionViolations);
    const shouldShowMarkAsResolved = isMarkAsResolvedAction(moneyRequestReport, transactionViolations);

    const shouldShowStatusBar =
        hasAllPendingRTERViolations ||
        shouldShowBrokenConnectionViolation ||
        hasOnlyHeldExpenses ||
        hasScanningReceipt ||
        isPayAtEndExpense ||
        hasOnlyPendingTransactions ||
        hasDuplicates ||
        shouldShowMarkAsResolved;

    const getStatusBarType = (): StatusBarType | undefined => {
        if (shouldShowMarkAsResolved) {
            return CONST.REPORT.STATUS_BAR_TYPE.MARK_AS_RESOLVED;
        }
        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return CONST.REPORT.STATUS_BAR_TYPE.BOOKING_PENDING;
            }
            if (archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return CONST.REPORT.STATUS_BAR_TYPE.BOOKING_ARCHIVED;
            }
        }
        if (hasOnlyHeldExpenses) {
            return CONST.REPORT.STATUS_BAR_TYPE.ON_HOLD;
        }
        if (hasDuplicates) {
            return CONST.REPORT.STATUS_BAR_TYPE.DUPLICATES;
        }
        if (!!transaction?.transactionID && !!transactionViolations.length && shouldShowBrokenConnectionViolation) {
            const brokenConnectionError = transactionViolations.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
            const cardID = brokenConnectionError?.data?.cardID;
            const card = cardID ? cardList?.[cardID] : undefined;
            if (isPersonalCard(card) && brokenConnectionError) {
                return undefined;
            }
            return CONST.REPORT.STATUS_BAR_TYPE.BROKEN_CONNECTION;
        }
        if (hasAllPendingRTERViolations) {
            return CONST.REPORT.STATUS_BAR_TYPE.PENDING_RTER;
        }
        if (hasOnlyPendingTransactions) {
            return CONST.REPORT.STATUS_BAR_TYPE.PENDING_TRANSACTIONS;
        }
        if (hasScanningReceipt) {
            return CONST.REPORT.STATUS_BAR_TYPE.SCANNING_RECEIPT;
        }
        return undefined;
    };

    const statusBarType = getStatusBarType();

    return {
        shouldShowStatusBar,
        statusBarType,
    };
}

export default useMoneyReportHeaderStatusBar;
export type {StatusBarType};
