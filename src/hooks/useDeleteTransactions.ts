import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {deleteMoneyRequest, getIOURequestPolicyID, initSplitExpenseItemData} from '@libs/actions/IOU';
import {getIOUActionForTransactions} from '@libs/actions/IOU/Duplicate';
import {updateSplitTransactions} from '@libs/actions/IOU/Split';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getChildTransactions, getOriginalTransactionWithSplitInfo} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseDeleteTransactionsParams = {
    /** Report object (optional, can be used for context) */
    report?: Report;
    /** Report actions array */
    reportActions: ReportAction[];
    /** Policy object (optional) */
    policy?: Policy;
};

/**
 * Pure hook for deleting transactions
 * All data must be provided through function parameters
 */
function useDeleteTransactions({report, reportActions, policy}: UseDeleteTransactionsParams) {
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(report?.policyID)}`, {canBeMissing: true});
    const [allPolicyRecentlyUsedCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES, {canBeMissing: true});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.reportID)}`, {canBeMissing: true});

    const {isBetaEnabled} = usePermissions();
    const archivedReportsIdSet = useArchivedReportsIdSet();

    /**
     * Delete transactions by IDs
     * @param transactionIDs - Array of transaction IDs to delete
     * @param duplicateTransactions - Collection of duplicate transactions
     * @param duplicateTransactionViolations - Collection of duplicate transaction violations
     * @param currentSearchHash - Current search hash for updating split transactions
     * @param onClearSelection - Optional callback to clear selection after deletion
     * @param isSingleTransactionView - Optional flag indicating if the deletion is from a single transaction view
     * @returns Array of deleted transaction thread report IDs for navigation handling
     */
    const deleteTransactions = useCallback(
        (
            transactionIDs: string[],
            duplicateTransactions: OnyxCollection<Transaction>,
            duplicateTransactionViolations: OnyxCollection<TransactionViolations>,
            currentSearchHash?: number,
            isSingleTransactionView?: boolean,
        ): string[] => {
            if (!transactionIDs.length) {
                return [];
            }

            const iouActions = reportActions.filter((action) => isMoneyRequestAction(action));

            const transactionsWithActions = transactionIDs.map((transactionID) => ({
                transactionID,
                transaction: allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`],
                action: iouActions.find((action) => {
                    const IOUTransactionID = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(action)?.IOUTransactionID;
                    return transactionID === IOUTransactionID;
                }),
            }));
            const deletedTransactionIDs: string[] = [];
            const deletedTransactionThreadReportIDs = new Set<string>();
            const {splitTransactionsByOriginalTransactionID, nonSplitTransactions} = transactionsWithActions.reduce(
                (acc, item) => {
                    const {transaction} = item;
                    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.comment?.originalTransactionID}`];
                    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
                    const originalTransactionID = transaction?.comment?.originalTransactionID;

                    if (isExpenseSplit && originalTransactionID) {
                        acc.splitTransactionsByOriginalTransactionID[originalTransactionID] ??= [];
                        acc.splitTransactionsByOriginalTransactionID[originalTransactionID].push(item);
                    } else {
                        acc.nonSplitTransactions.push(item);
                    }

                    return acc;
                },
                {splitTransactionsByOriginalTransactionID: {}, nonSplitTransactions: []} as {
                    splitTransactionsByOriginalTransactionID: Record<string, Array<{transactionID: string; action?: ReportAction; transaction?: Transaction}>>;
                    nonSplitTransactions: Array<{transactionID: string; action?: ReportAction; transaction?: Transaction}>;
                },
            );

            for (const transactionID of Object.keys(splitTransactionsByOriginalTransactionID)) {
                const splitIDs = new Set((splitTransactionsByOriginalTransactionID[transactionID] ?? []).map((transaction) => transaction.transactionID));
                const childTransactions = getChildTransactions(allTransactions, allReports, transactionID).filter(
                    (transaction) => !splitIDs.has(transaction?.transactionID ?? String(CONST.DEFAULT_NUMBER_ID)),
                );

                if (childTransactions.length === 0) {
                    nonSplitTransactions.push(...splitTransactionsByOriginalTransactionID[transactionID]);
                    continue;
                }
                const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                const originalTransactionIouActions = getIOUActionForTransactions([transactionID], report?.reportID);
                const iouReportID = isMoneyRequestAction(originalTransactionIouActions.at(0)) ? getOriginalMessage(originalTransactionIouActions.at(0))?.IOUReportID : undefined;
                const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
                const policyRecentlyUsedCategories =
                    allPolicyRecentlyUsedCategories?.[
                        `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getNonEmptyStringOnyxID(getIOURequestPolicyID(originalTransaction, report))}`
                    ] ?? [];

                const hasEditableSplitExpensesLeft = childTransactions.some((childTransaction) => {
                    const currentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${childTransaction?.reportID}`];
                    return (currentReport?.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED;
                });

                if (!hasEditableSplitExpensesLeft) {
                    nonSplitTransactions.push(...splitTransactionsByOriginalTransactionID[transactionID]);
                    continue;
                }

                const remainingSplitExpenses = childTransactions.map((childTransaction) => initSplitExpenseItemData(childTransaction));

                updateSplitTransactions({
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    transactionData: {
                        reportID: report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                        originalTransactionID: transactionID,
                        splitExpenses: remainingSplitExpenses,
                    },
                    searchContext: {
                        currentSearchHash: currentSearchHash ?? 0,
                    },
                    policyCategories,
                    policy,
                    policyRecentlyUsedCategories,
                    iouReport,
                    firstIOU: originalTransactionIouActions.at(0),
                    isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                    currentUserPersonalDetails,
                    transactionViolations,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    quickAction,
                    iouReportNextStep,
                });
            }

            for (const {transactionID, action} of nonSplitTransactions) {
                if (!action) {
                    continue;
                }
                const iouReportID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUReportID : undefined;
                const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
                const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
                const chatIOUReportID = chatReport?.reportID;
                const isChatIOUReportArchived = archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatIOUReportID}`);
                deleteMoneyRequest({
                    transactionID,
                    reportAction: action,
                    transactions: duplicateTransactions,
                    violations: duplicateTransactionViolations,
                    iouReport,
                    chatReport,
                    isChatIOUReportArchived,
                    isSingleTransactionView,
                    transactionIDsPendingDeletion: deletedTransactionIDs,
                    selectedTransactionIDs: transactionIDs,
                    hash: currentSearchHash,
                    allTransactionViolationsParam: transactionViolations,
                });
                deletedTransactionIDs.push(transactionID);
                if (action.childReportID) {
                    deletedTransactionThreadReportIDs.add(action.childReportID);
                }
            }

            return Array.from(deletedTransactionThreadReportIDs);
        },
        [
            allPolicyRecentlyUsedCategories,
            allReportNameValuePairs,
            allReports,
            allTransactions,
            archivedReportsIdSet,
            currentUserPersonalDetails,
            iouReportNextStep,
            isBetaEnabled,
            policy,
            policyCategories,
            policyRecentlyUsedCurrencies,
            quickAction,
            report,
            reportActions,
            transactionViolations,
        ],
    );

    return {
        deleteTransactions,
    };
}

export default useDeleteTransactions;
