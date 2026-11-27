import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SelectedReports} from '@components/Search/types';

import {bulkDuplicateReports} from '@libs/actions/IOU/Duplicate';
import {getMoneyRequestParticipantsFromReport} from '@libs/actions/IOU/MoneyRequest';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {hasSeenTourSelector, isTrackIntentUserSelector} from '@selectors/Onboarding';
import {policyExpenseChatSelector} from '@selectors/Report';
import Onyx from 'react-native-onyx';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {useGetPersonalDetailsByLogin} from './usePersonalDetailByLogin';
import {usePersonalDetailsByIDs} from './usePersonalDetails';

type UseBulkDuplicateReportActionParams = {
    selectedReports: SelectedReports[];
    allReports: OnyxCollection<Report> | undefined;
    allTransactions: OnyxCollection<Transaction>;
    searchData: Record<string, unknown> | undefined;
};

function useBulkDuplicateReportAction({selectedReports, allReports, allTransactions, searchData}: UseBulkDuplicateReportActionParams) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const getPersonalDetailsByLogin = useGetPersonalDetailsByLogin();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {translate, formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();

    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyExpenseChat] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: policyExpenseChatSelector(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id)});
    const [personalDetails] = usePersonalDetailsByIDs(
        [
            activePolicyExpenseChat,
            ...selectedReports.map((selectedReport) => allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.chatReportID ?? selectedReport.parentReportID}`]),
        ].map((chatReport) => getMoneyRequestParticipantsFromReport(chatReport, currentUserPersonalDetails.accountID).at(0)?.accountID),
    );
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const duplicateSelectedReports = async () => {
        const [quickAction, policyRecentlyUsedCurrencies, onboarding, recentWaypoints, allPolicyCategories, allPolicyTags, introSelected, conciergeChat, rules] = await Onyx.multiGet([
            ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            ONYXKEYS.RECENTLY_USED_CURRENCIES,
            ONYXKEYS.NVP_ONBOARDING,
            ONYXKEYS.NVP_RECENT_WAYPOINTS,
            ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
            ONYXKEYS.COLLECTION.POLICY_TAGS,
            ONYXKEYS.NVP_INTRO_SELECTED,
            `${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`,
            ONYXKEYS.COLLECTION.RULE,
        ]);

        bulkDuplicateReports({
            isVendorMatchingBetaEnabled,
            personalDetailsByLogins: getPersonalDetailsByLogin(),
            selectedReports,
            allReports: allReports ?? {},
            searchData,
            allPolicies,
            allTransactions,
            allPolicyCategories,
            allPolicyTags,
            defaultExpensePolicy,
            activePolicyExpenseChat,
            ownerPersonalDetails: currentUserPersonalDetails,
            isASAPSubmitBetaEnabled,
            personalDetails,
            quickAction,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            isSelfTourViewed: hasSeenTourSelector(onboarding),
            transactionViolations: allTransactionViolations,
            translate,
            recentWaypoints,
            currentUserLogin: currentUserPersonalDetails.login ?? '',
            currentUserAccountID: currentUserPersonalDetails?.accountID,
            isTrackIntentUser: isTrackIntentUserSelector(introSelected),
            delegateAccountID,
            formatPhoneNumber,
            getCurrencyDecimals,
            conciergeChat,
            rules,
        }).catch((error: unknown) => {
            Log.warn('[useBulkDuplicateReportAction] Failed to duplicate the selected reports', {error});
        });

        clearSelectedTransactions(undefined, true);
    };

    return duplicateSelectedReports;
}

export default useBulkDuplicateReportAction;
