import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import type {OnyxCollection} from 'react-native-onyx';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {SelectedReports} from '@components/Search/types';
import {bulkDuplicateReports} from '@libs/actions/IOU/Duplicate';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseBulkDuplicateReportActionParams = {
    selectedReports: SelectedReports[];
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
};

function useBulkDuplicateReportAction({selectedReports, allReports, searchData}: UseBulkDuplicateReportActionParams) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {translate} = useLocalize();

    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);

    const handleDuplicateReports = () => {
        const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id);

        bulkDuplicateReports({
            selectedReports,
            allReports: allReports ?? {},
            searchData,
            allPolicies,
            allPolicyCategories,
            allPolicyTags,
            defaultExpensePolicy,
            activePolicyExpenseChat,
            ownerPersonalDetails: currentUserPersonalDetails,
            currentUserLogin: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled,
            betas,
            personalDetails,
            quickAction,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            draftTransactionIDs,
            isSelfTourViewed,
            transactionViolations: allTransactionViolations,
            translate,
            recentWaypoints,
        });

        clearSelectedTransactions(undefined, true);
    };

    return handleDuplicateReports;
}

export default useBulkDuplicateReportAction;
