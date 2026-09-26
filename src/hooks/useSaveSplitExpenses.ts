import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import {getIOUActionForTransactions} from '@libs/actions/IOU/Duplicate';
import {getIOURequestPolicyID} from '@libs/actions/IOU/MoneyRequest';
import {updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/SplitTransactionUpdate';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSelfDM} from '@libs/ReportUtils';
import {getActiveGroupSearchHashes} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SplitExpense} from '@src/types/onyx/IOU';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import useAllTransactions from './useAllTransactions';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useGetIOUReportFromReportAction from './useGetIOUReportFromReportAction';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {useAllPersonalDetails} from './usePersonalDetails';
import useReportOrReportDraft from './useReportOrReportDraft';

type UseSaveSplitExpensesParams = {
    /** ID of the transaction being split, which is also the key of its split draft */
    originalTransactionID: string | undefined;

    /** ID of the report the split flow was opened from */
    reportID: string | undefined;

    /** Whether the split flow was opened from a Search page */
    isSearchBackPath: boolean;
};

/**
 * Returns a callback that commits the given split expenses of the split draft for `originalTransactionID`.
 */
function useSaveSplitExpenses({originalTransactionID, reportID, isSearchBackPath}: UseSaveSplitExpensesParams) {
    const {formatPhoneNumber} = useLocalize();
    const delegateAccountID = useDelegateAccountID();
    const {isOffline} = useNetwork();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchHash, currentSearchQueryJSON} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const allTransactions = useAllTransactions();
    const [personalDetails] = useAllPersonalDetails();

    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(originalTransactionID)}`);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allSnapshots] = useOnyx(ONYXKEYS.COLLECTION.SNAPSHOT);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(originalTransactionID)}`];
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getIOURequestPolicyID(transaction, currentReport)}`);

    const draftTransactionReport = useReportOrReportDraft(draftTransaction?.reportID);
    const parentTransactionReport = useReportOrReportDraft(draftTransactionReport?.parentReportID);
    const expenseReport = draftTransactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? draftTransactionReport : parentTransactionReport;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`);
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`);

    // For selfDM expenses, the IOU action lives in the selfDM report, not in an expense report.
    const iouReportIDForActions = expenseReport?.reportID ?? (isSelfDM(draftTransactionReport) ? draftTransactionReport?.reportID : undefined);
    const iouActions = getIOUActionForTransactions(
        [draftTransaction?.comment?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID],
        allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportIDForActions}`],
    ).filter((action) => action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const {iouReport} = useGetIOUReportFromReportAction(iouActions.at(0));

    const activeGroupSearchHashes = isSearchBackPath ? getActiveGroupSearchHashes(currentSearchResults?.data, currentSearchQueryJSON) : [];

    return (splitExpenses: SplitExpense[]) => {
        updateSplitTransactionsFromSplitExpensesFlow({
            isVendorMatchingBetaEnabled,
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
                splitExpenses,
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
    };
}

export default useSaveSplitExpenses;
