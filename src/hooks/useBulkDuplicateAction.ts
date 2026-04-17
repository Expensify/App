import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import {bulkDuplicateExpenses} from '@libs/actions/IOU/Duplicate';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseBulkDuplicateActionParams = {
    selectedTransactionsKeys: string[];
    allTransactions: OnyxCollection<Transaction>;
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
    onAfterDuplicate?: () => void;
};

/**
 * Hook that subscribes to action-time-only Onyx data needed for bulk expense duplication.
 * Designed to be called inside a component that only mounts when the duplicate option is visible,
 * so these subscriptions don't exist for users who aren't actively duplicating.
 */
function useBulkDuplicateAction({selectedTransactionsKeys, allTransactions, allReports, searchData, onAfterDuplicate}: UseBulkDuplicateActionParams) {
    const {accountID} = useCurrentUserPersonalDetails();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [targetPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`);
    const [targetPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${defaultExpensePolicy?.id}`);

    const sourcePolicyIDMap: Record<string, string | undefined> = {};
    for (const transactionID of selectedTransactionsKeys) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        const reportID = transaction?.reportID;
        if (!reportID) {
            continue;
        }
        const report = (searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] as Report | undefined) ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        sourcePolicyIDMap[transactionID] = report?.policyID;
    }

    const handleDuplicate = () => {
        const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);

        bulkDuplicateExpenses({
            transactionIDs: selectedTransactionsKeys,
            allTransactions: allTransactions ?? {},
            sourcePolicyIDMap,
            targetPolicy: (defaultExpensePolicy ?? undefined) as OnyxEntry<Policy>,
            targetPolicyCategories: targetPolicyCategories ?? {},
            targetPolicyTags: targetPolicyTags ?? {},
            targetReport: activePolicyExpenseChat,
            personalDetails,
            isASAPSubmitBetaEnabled,
            introSelected,
            activePolicyID,
            quickAction,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            isSelfTourViewed,
            transactionDrafts,
            draftTransactionIDs,
            betas,
            recentWaypoints,
        });

        if (onAfterDuplicate) {
            onAfterDuplicate();
        } else {
            clearSelectedTransactions();
        }
    };

    return handleDuplicate;
}

export default useBulkDuplicateAction;
