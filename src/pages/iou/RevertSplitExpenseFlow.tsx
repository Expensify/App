import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import useAllTransactions from '@hooks/useAllTransactions';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';

import {getIOUActionForTransactions} from '@libs/actions/IOU/Duplicate';
import {getIOURequestPolicyID} from '@libs/actions/IOU/MoneyRequest';
import {updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/SplitTransactionUpdate';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSelfDM} from '@libs/ReportUtils';
import {getActiveGroupSearchHashes} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SplitExpense} from '@src/types/onyx/IOU';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {useEffect, useRef} from 'react';

type RevertSplitExpenseFlowProps = {
    /** ID of the transaction being split, which is also the key of its split draft */
    originalTransactionID: string | undefined;

    /** ID of the report the split flow was opened from */
    reportID: string | undefined;

    /** The split expenses left after the removal, which are committed to revert the split */
    remainingSplitExpenses: SplitExpense[];

    /** Whether the split flow was opened from a Search page */
    isSearchBackPath: boolean;
};

/**
 * Commits the remaining split expenses the same way the split overview's Save does, then navigates away.
 * It is mounted only once a revert is needed, so the Onyx data the save needs (report actions, snapshots,
 * all policy tags, etc.) is subscribed to only for the lifetime of the revert instead of on every visit to the edit page.
 */
function RevertSplitExpenseFlow({originalTransactionID, reportID, remainingSplitExpenses, isSearchBackPath}: RevertSplitExpenseFlowProps) {
    const {formatPhoneNumber} = useLocalize();
    const delegateAccountID = useDelegateAccountID();
    const {isOffline} = useNetwork();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchHash, currentSearchQueryJSON} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const allTransactions = useAllTransactions();
    const [personalDetails] = useAllPersonalDetails();

    const [draftTransaction, draftTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(originalTransactionID)}`);
    const [allReports, allReportsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions, allReportActionsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportNameValuePairs, allReportNameValuePairsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allSnapshots, allSnapshotsResult] = useOnyx(ONYXKEYS.COLLECTION.SNAPSHOT);
    const [allPolicyTags, allPolicyTagsResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [transactionViolations, transactionViolationsResult] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [quickAction, quickActionResult] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isTrackIntentUser, isTrackIntentUserResult] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules, rulesResult] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [policyRecentlyUsedCurrencies, policyRecentlyUsedCurrenciesResult] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(originalTransactionID)}`];
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];
    const [policyRecentlyUsedCategories, policyRecentlyUsedCategoriesResult] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getIOURequestPolicyID(transaction, currentReport)}`,
    );

    const draftTransactionReport = useReportOrReportDraft(draftTransaction?.reportID);
    const parentTransactionReport = useReportOrReportDraft(draftTransactionReport?.parentReportID);
    const expenseReport = draftTransactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? draftTransactionReport : parentTransactionReport;
    const [policyCategories, policyCategoriesResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`);
    const [expenseReportPolicy, expenseReportPolicyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`);

    // For selfDM expenses, the IOU action lives in the selfDM report, not in an expense report.
    const iouReportIDForActions = expenseReport?.reportID ?? (isSelfDM(draftTransactionReport) ? draftTransactionReport?.reportID : undefined);
    const iouActions = getIOUActionForTransactions(
        [draftTransaction?.comment?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID],
        allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportIDForActions}`],
    ).filter((action) => action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const {iouReport} = useGetIOUReportFromReportAction(iouActions.at(0));

    const isLoadingData = isLoadingOnyxValue(
        draftTransactionResult,
        allReportsResult,
        allReportActionsResult,
        allReportNameValuePairsResult,
        allSnapshotsResult,
        allPolicyTagsResult,
        transactionViolationsResult,
        quickActionResult,
        isTrackIntentUserResult,
        rulesResult,
        policyRecentlyUsedCurrenciesResult,
        policyRecentlyUsedCategoriesResult,
        policyCategoriesResult,
        expenseReportPolicyResult,
    );

    // Commits the split once, as soon as all the Onyx data the save depends on has loaded.
    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        const activeGroupSearchHashes = isSearchBackPath ? getActiveGroupSearchHashes(currentSearchResults?.data, currentSearchQueryJSON) : [];
        updateSplitTransactionsFromSplitExpensesFlow({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            getCurrencyDecimals,
            getCurrencySymbol,
            allTransactionsList: allTransactions,
            allReportsList: allReports,
            allReportActionsList: allReportActions,
            allReportNameValuePairsList: allReportNameValuePairs,
            allSnapshots,
            allPolicyTags,
            transactionData: {
                reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                splitExpenses: remainingSplitExpenses,
                splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal ?? 0,
            },
            searchContext: {currentSearchHash: isSearchBackPath ? currentSearchHash : undefined, activeGroupSearchHashes, clearSelectedTransactions},
            policyCategories,
            policy: expenseReportPolicy,
            policyRecentlyUsedCategories,
            iouReport,
            firstIOU: iouActions.at(0),
            extraIOUActions: iouActions.slice(1),
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            currentUserPersonalDetails,
            transactionViolations,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            quickAction,
            personalDetails,
            transactionReport: draftTransactionReport,
            expenseReport,
            isOffline,
            delegateAccountID,
            isTrackIntentUser,
            formatPhoneNumber,
            rules,
        });
    });

    // The save navigates away on its own, so the flow itself renders nothing.
    return null;
}

export default RevertSplitExpenseFlow;
