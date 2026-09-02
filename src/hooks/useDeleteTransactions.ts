import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';

import {deleteMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import {getIOUActionForTransactions} from '@libs/actions/IOU/Duplicate';
import {getIOURequestPolicyID} from '@libs/actions/IOU/MoneyRequest';
import {initSplitExpenseItemData} from '@libs/actions/IOU/SplitExpenseItems';
import {updateSplitTransactions} from '@libs/actions/IOU/SplitTransactionUpdate';
import {deleteTrackExpense} from '@libs/actions/IOU/TrackExpense';
import initSplitExpense from '@libs/actions/SplitExpenses';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {calculateAmount as calculateIOUAmount} from '@libs/IOUUtils';
import {getOriginalMessage, isActionableTrackExpense, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {isArchivedReport, isExpenseReport, isInvoiceReport, isIOUReport, isSelfDM} from '@libs/ReportUtils';
import {getActiveGroupSearchHashes} from '@libs/SearchUIUtils';
import {
    getChildTransactions,
    getOriginalTransactionWithSplitInfo,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isSplitChildTransaction,
    shouldRedirectDeleteToSplitExpenseEdit,
} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolations} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';

import type {OnyxCollection} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {useCallback} from 'react';

import type {CurrencyListActionsContextType} from './useCurrencyList';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePersonalPolicy from './usePersonalPolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';
import useRestrictedActionPolicyID from './useRestrictedActionPolicyID';
import {findSplitPolicyForCustomUnit, getSplitEffectivePolicy} from './useSplitEffectivePolicy';

type UseDeleteTransactionsParams = {
    /** Report object (optional, can be used for context) */
    report?: Report;
    /** Report actions array */
    reportActions: ReportAction[];
    /** Policy object (optional) */
    policy?: Policy;
};

type DeleteTransactionsResult =
    | {
          action: 'redirected';
      }
    | {
          action: 'deleted';
          deletedTransactionThreadReportIDs: string[];
      };

type TransactionWithAction = {transactionID: string; action?: ReportAction; transaction?: Transaction};

function redistributeRemainingPerDiemSplitExpenses(
    splitExpenses: SplitExpense[],
    total: number,
    currency: string,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
): SplitExpense[] {
    const lastSplitIndex = splitExpenses.length - 1;

    return splitExpenses.map((splitExpense, index) => ({
        ...splitExpense,
        amount: calculateIOUAmount(lastSplitIndex, total, currency, index === lastSplitIndex, true, getCurrencyDecimals),
    }));
}

/**
 * Pure hook for deleting transactions
 * All data must be provided through function parameters
 */
function useDeleteTransactions({report, reportActions, policy}: UseDeleteTransactionsParams) {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [allPolicyRecentlyUsedCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES);
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allSnapshots] = useOnyx(ONYXKEYS.COLLECTION.SNAPSHOT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {isBetaEnabled} = usePermissions();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const personalPolicy = usePersonalPolicy();
    const restrictedActionPolicyID = useRestrictedActionPolicyID(policy);
    const {isOffline} = useNetwork();
    const {formatPhoneNumber} = useLocalize();

    const getSplitExpenseEditTransactionOnDelete = useCallback(
        (transactionIDs: string[]): Transaction | undefined => {
            if (transactionIDs.length !== 1) {
                return undefined;
            }

            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`];

            if (!transaction) {
                return undefined;
            }

            const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.comment?.originalTransactionID}`];
            const isSelfDMSplit = isSelfDM(report) || (!!selfDMReportID && transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID);
            const hasMultipleSplits = getChildTransactions(allTransactions, originalTransaction?.transactionID).length > 1;
            if (!shouldRedirectDeleteToSplitExpenseEdit(transaction, originalTransaction, isSelfDMSplit) || (!hasMultipleSplits && isPerDiemRequestTransactionUtils(originalTransaction))) {
                return undefined;
            }

            return transaction;
        },
        [allTransactions, report, selfDMReportID],
    );

    const shouldOpenSplitExpenseEditFlowOnDelete = useCallback(
        (transactionIDs: string[]): boolean => !!getSplitExpenseEditTransactionOnDelete(transactionIDs),
        [getSplitExpenseEditTransactionOnDelete],
    );

    /**
     * Delete transactions by IDs
     * @param transactionIDs - Array of transaction IDs to delete
     * @param duplicateTransactions - Collection of duplicate transactions
     * @param duplicateTransactionViolations - Collection of duplicate transaction violations
     * @param currentSearchHash - Current search hash for updating split transactions
     * @param isSingleTransactionView - Optional flag indicating if the deletion is from a single transaction view
     * @returns Result describing whether the delete redirected or deleted transaction threads
     */
    const deleteTransactions = useCallback(
        (
            transactionIDs: string[],
            duplicateTransactions: OnyxCollection<Transaction>,
            duplicateTransactionViolations: OnyxCollection<TransactionViolations>,
            currentSearchHash?: number,
            isSingleTransactionView?: boolean,
        ): DeleteTransactionsResult => {
            if (!transactionIDs.length) {
                return {
                    action: 'deleted',
                    deletedTransactionThreadReportIDs: [],
                };
            }

            const splitExpenseEditTransaction = getSplitExpenseEditTransactionOnDelete(transactionIDs);

            if (splitExpenseEditTransaction) {
                const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpenseEditTransaction.reportID}`];
                const selfDMReport = isSelfDM(report) ? report : allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`];
                const splitExpenseEditTransactionReport = transactionReport ?? selfDMReport;
                // We intentionally don't pass `searchSnapshotPolicy` here (unlike the on-page split flow in
                // `useSplitEffectivePolicy`). This preserves the pre-refactor behavior: `initSplitExpense` resolved
                // the policy from the report policy and the transaction's customUnit only, never from a search-results
                // snapshot. The snapshot-aware branch lives on the split pages, where the mileage rate is rendered.
                const splitEffectivePolicy = getSplitEffectivePolicy({
                    policy,
                    transaction: splitExpenseEditTransaction,
                    policyForCustomUnit: findSplitPolicyForCustomUnit(allPolicies, splitExpenseEditTransaction),
                    fallbackPolicy: policyForMovingExpenses,
                });
                initSplitExpense(
                    splitExpenseEditTransaction,
                    splitExpenseEditTransactionReport,
                    splitEffectivePolicy,
                    selfDMReportID,
                    restrictedActionPolicyID,
                    personalPolicy?.outputCurrency,
                    getCurrencyDecimals,
                    getCurrencySymbol,
                    {
                        navigateToEditSplitExpense: true,
                    },
                );
                return {
                    action: 'redirected',
                };
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

                    const transactionCurrentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
                    const isMovedExpenseSplitChild =
                        !isExpenseSplit && !!originalTransactionID && isSplitChildTransaction(transaction) && !originalTransaction?.comment?.splits && isIOUReport(transactionCurrentReport);

                    if ((isExpenseSplit || isMovedExpenseSplitChild) && originalTransactionID) {
                        acc.splitTransactionsByOriginalTransactionID[originalTransactionID] ??= [];
                        acc.splitTransactionsByOriginalTransactionID[originalTransactionID].push(item);
                    } else {
                        acc.nonSplitTransactions.push(item);
                    }

                    return acc;
                },
                {splitTransactionsByOriginalTransactionID: {}, nonSplitTransactions: []} as {
                    splitTransactionsByOriginalTransactionID: Record<string, TransactionWithAction[]>;
                    nonSplitTransactions: TransactionWithAction[];
                },
            );

            for (const transactionID of Object.keys(splitTransactionsByOriginalTransactionID)) {
                const splitIDs = new Set((splitTransactionsByOriginalTransactionID[transactionID] ?? []).map((transaction) => transaction.transactionID));
                const allChildTransactions = getChildTransactions(allTransactions, transactionID);
                const childTransactions = allChildTransactions.filter((transaction) => !splitIDs.has(transaction?.transactionID ?? String(CONST.DEFAULT_NUMBER_ID)));

                if (childTransactions.length === 0) {
                    nonSplitTransactions.push(...splitTransactionsByOriginalTransactionID[transactionID]);
                    continue;
                }
                const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                const originalTransactionIouActions = getIOUActionForTransactions([transactionID], allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`]);
                const iouReportID = isMoneyRequestAction(originalTransactionIouActions.at(0)) ? originalTransactionIouActions.at(0)?.reportID : undefined;
                const candidateIOUReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
                // For self-DM tracks and split bills, action.reportID resolves to a chat report, not an IOU/expense report.
                const iouReport = isIOUReport(candidateIOUReport) || isExpenseReport(candidateIOUReport) ? candidateIOUReport : undefined;
                const splitExpensesTotal = allChildTransactions.reduce((total, childTransaction) => {
                    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${childTransaction?.reportID}`];
                    return total + initSplitExpenseItemData(childTransaction, transactionReport, {getCurrencyDecimals}).amount;
                }, 0);
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

                const remainingSplitExpenses = childTransactions.map((childTransaction) => {
                    // For selfDM splits, childTransaction.reportID is UNREPORTED_REPORT_ID ('0'), which does not map to a
                    // real report. Resolve it to the actual selfDM report ID (same approach as initSplitExpense) so that
                    // updateSplitTransactions can route the restored transaction to the correct report instead of ending
                    // up with an undefined reportID downstream.
                    const resolvedReportID = childTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? selfDMReportID : childTransaction?.reportID;
                    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${resolvedReportID}`];
                    return initSplitExpenseItemData(childTransaction, transactionReport, {reportID: resolvedReportID, getCurrencyDecimals});
                });
                const remainingSplitExpensesTotal = remainingSplitExpenses.reduce((total, splitExpense) => total + splitExpense.amount, 0);
                const updatedRemainingSplitExpenses =
                    originalTransaction && isPerDiemRequestTransactionUtils(originalTransaction) && remainingSplitExpenses.length > 0 && remainingSplitExpensesTotal !== splitExpensesTotal
                        ? redistributeRemainingPerDiemSplitExpenses(remainingSplitExpenses, splitExpensesTotal, originalTransaction.currency ?? CONST.CURRENCY.USD, getCurrencyDecimals)
                        : remainingSplitExpenses;

                const parentTransactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
                const expenseReport = report?.type === CONST.REPORT.TYPE.EXPENSE ? report : parentTransactionReport;
                const activeGroupSearchHashes =
                    currentSearchHash !== undefined && currentSearchHash >= 0 ? getActiveGroupSearchHashes(currentSearchResults?.data, currentSearchQueryJSON) : [];

                updateSplitTransactions({
                    getCurrencyDecimals,
                    getCurrencySymbol,
                    allTransactionsList: allTransactions,
                    allReportsList: allReports,
                    allReportActionsList: allReportActions,
                    allReportNameValuePairsList: allReportNameValuePairs,
                    allSnapshots,
                    allPolicyTags,
                    transactionData: {
                        reportID: report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                        originalTransactionID: transactionID,
                        splitExpenses: updatedRemainingSplitExpenses,
                        splitExpensesTotal,
                    },
                    searchContext: {
                        currentSearchHash,
                        activeGroupSearchHashes,
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
                    betas,
                    personalDetails,
                    transactionReport: report,
                    expenseReport,
                    isOffline,
                    delegateAccountID,
                    isTrackIntentUser,
                    formatPhoneNumber,
                });
            }

            for (const {transactionID, action} of nonSplitTransactions) {
                if (!action) {
                    continue;
                }
                const iouReportID = isMoneyRequestAction(action) ? action?.reportID : undefined;
                const candidateIOUReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
                // For self-DM tracks and split bills, action.reportID resolves to a chat report, not an IOU/expense report.
                // Invoice reports also carry the money request action; without them the optimistic delete would run with an
                // undefined iouReport, so the invoice/preview would not be marked deleted (visible until a server response,
                // or indefinitely offline). Its chatReportID points to the invoice room. See issue #97399.
                const iouReport = isIOUReport(candidateIOUReport) || isExpenseReport(candidateIOUReport) || isInvoiceReport(candidateIOUReport) ? candidateIOUReport : undefined;
                const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
                const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${action?.childReportID}`];

                // A self-DM expense is a tracked expense: it has no IOU report to key the cleanup on, so it goes
                // through the track-expense flow, which resolves the self-DM report actions and the whisper.
                if (isSelfDM(candidateIOUReport) && isTrackExpenseAction(action)) {
                    // The Onyx collection can be missing the self-DM actions when the delete comes from Search, where
                    // they are read from the search snapshot instead, so the ones passed in fill the gaps. Actionable
                    // track expense whispers are matched on their own since they are built without a `reportID`.
                    const selfDMReportActions: ReportActions = {
                        ...Object.fromEntries(
                            reportActions
                                .filter((chatAction) => chatAction.reportID === candidateIOUReport?.reportID || isActionableTrackExpense(chatAction))
                                .map((chatAction) => [chatAction.reportActionID, chatAction]),
                        ),
                        ...allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${candidateIOUReport?.reportID}`],
                    };

                    deleteTrackExpense({
                        chatReportID: candidateIOUReport?.reportID,
                        chatReport: candidateIOUReport,
                        chatReportActions: selfDMReportActions,
                        transactionID,
                        reportAction: action,
                        iouReport: undefined,
                        chatIOUReport: undefined,
                        transactions: duplicateTransactions,
                        violations: duplicateTransactionViolations,
                        isSingleTransactionView,
                        isChatReportArchived: isArchivedReport(allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${candidateIOUReport?.reportID}`]),
                        isChatIOUReportArchived: false,
                        allTransactionViolationsParam: transactionViolations,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        currentUserEmail: currentUserPersonalDetails.email ?? '',
                        policy: undefined,
                        getCurrencyDecimals,
                    });
                    deletedTransactionIDs.push(transactionID);
                    if (action.childReportID) {
                        deletedTransactionThreadReportIDs.add(action.childReportID);
                    }
                    continue;
                }

                const chatIOUReportID = chatReport?.reportID;
                const isChatIOUReportArchived = isArchivedReport(allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatIOUReportID}`]);
                const iouPolicy = iouReport?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`] : undefined;
                deleteMoneyRequest({
                    transactionID,
                    reportAction: action,
                    transactionThreadReport,
                    transactions: duplicateTransactions,
                    violations: duplicateTransactionViolations,
                    iouReport,
                    chatReport,
                    isChatIOUReportArchived,
                    isSingleTransactionView,
                    transactionIDsPendingDeletion: deletedTransactionIDs,
                    selectedTransactionIDs: transactionIDs,
                    allTransactionViolationsParam: transactionViolations,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    currentUserEmail: currentUserPersonalDetails.email ?? '',
                    policy: iouPolicy,
                    getCurrencyDecimals,
                });
                deletedTransactionIDs.push(transactionID);
                if (action.childReportID) {
                    deletedTransactionThreadReportIDs.add(action.childReportID);
                }
            }

            return {
                action: 'deleted',
                deletedTransactionThreadReportIDs: Array.from(deletedTransactionThreadReportIDs),
            };
        },
        [
            allPolicyRecentlyUsedCategories,
            allReportNameValuePairs,
            allReports,
            allReportActions,
            allSnapshots,
            allTransactions,
            currentUserPersonalDetails,
            currentSearchQueryJSON,
            currentSearchResults?.data,
            isBetaEnabled,
            policy,
            policyCategories,
            policyRecentlyUsedCurrencies,
            quickAction,
            report,
            reportActions,
            transactionViolations,
            betas,
            allPolicyTags,
            personalDetails,
            selfDMReportID,
            allPolicies,
            policyForMovingExpenses,
            restrictedActionPolicyID,
            getSplitExpenseEditTransactionOnDelete,
            isOffline,
            personalPolicy?.outputCurrency,
            delegateAccountID,
            isTrackIntentUser,
            formatPhoneNumber,
            getCurrencyDecimals,
            getCurrencySymbol,
        ],
    );

    return {
        deleteTransactions,
        shouldOpenSplitExpenseEditFlowOnDelete,
    };
}

export default useDeleteTransactions;
