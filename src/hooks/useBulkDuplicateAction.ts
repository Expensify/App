import {useSearchSelectionActions} from '@components/Search/SearchContext';

import {bulkDuplicateExpenses} from '@libs/actions/IOU/Duplicate';
import Navigation from '@libs/Navigation/Navigation';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {canDuplicateExpenseIntoSourceReport, getPolicyExpenseChat} from '@libs/ReportUtils';

import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useMoneyRequestPolicyTagsForReport from './useMoneyRequestPolicyTagsForReport';
import useOnyx from './useOnyx';
import useParticipantsPolicyTags from './useParticipantsPolicyTags';
import usePermissions from './usePermissions';
import {useAllPersonalDetails} from './usePersonalDetails';
import useReportIsArchived from './useReportIsArchived';
import useRestrictedActionPolicyID from './useRestrictedActionPolicyID';

type UseBulkDuplicateActionParams = {
    selectedTransactionsKeys: string[];
    allTransactions: OnyxCollection<Transaction>;
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
    onAfterDuplicate?: () => void;

    /** The expense report the selection was made on, so the copies can stay on it when it can accept them */
    sourceReport?: OnyxEntry<Report>;
    sourceChatReport?: OnyxEntry<Report>;
    sourcePolicy?: OnyxEntry<Policy>;
};

/**
 * Hook that subscribes to action-time-only Onyx data needed for bulk expense duplication.
 * Designed to be called inside a component that only mounts when the duplicate option is visible,
 * so these subscriptions don't exist for users who aren't actively duplicating.
 */
function useBulkDuplicateAction({
    selectedTransactionsKeys,
    allTransactions,
    allReports,
    searchData,
    onAfterDuplicate,
    sourceReport,
    sourceChatReport,
    sourcePolicy,
}: UseBulkDuplicateActionParams) {
    const {accountID, login: currentUserLogin, localCurrencyCode} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const [personalDetails] = useAllPersonalDetails();
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);
    const isSourceReportArchived = useReportIsArchived(sourceReport?.reportID);
    const isSourceChatReportArchived = useReportIsArchived(sourceChatReport?.reportID);

    // Duplicate target: the source report when every copy comes from it and it can accept them, otherwise the default workspace chat
    const areAllSelectedTransactionsOnSourceReport =
        !!sourceReport?.reportID &&
        selectedTransactionsKeys.every((transactionID) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID === sourceReport.reportID);
    const canDuplicateIntoSourceReport =
        areAllSelectedTransactionsOnSourceReport &&
        canDuplicateExpenseIntoSourceReport({
            sourceReport,
            chatReport: sourceChatReport,
            policy: sourcePolicy,
            currentUserLogin: currentUserLogin ?? '',
            isSourceReportArchived,
            isChatReportArchived: isSourceChatReportArchived,
            isASAPSubmitBetaEnabled,
            rules,
        });
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const duplicateTargetPolicy = canDuplicateIntoSourceReport ? sourcePolicy : defaultExpensePolicy;
    const duplicateTargetReport = canDuplicateIntoSourceReport ? sourceReport : activePolicyExpenseChat;

    const [targetPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${duplicateTargetPolicy?.id}`);
    const [targetPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${duplicateTargetPolicy?.id}`);
    const restrictedActionPolicyID = useRestrictedActionPolicyID(duplicateTargetPolicy);

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

    const policyTagList = useMoneyRequestPolicyTagsForReport({report: duplicateTargetReport, currentUserAccountID: accountID});
    const participants = getMoneyRequestParticipantsFromReport(duplicateTargetReport, accountID);
    const participantsPolicyTags = useParticipantsPolicyTags(participants);

    const handleDuplicate = () => {
        if (restrictedActionPolicyID) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedActionPolicyID));
            return;
        }

        bulkDuplicateExpenses({
            isVendorMatchingBetaEnabled,
            dateFnsLocale,
            getCurrencyDecimals,
            transactionIDs: selectedTransactionsKeys,
            allTransactions: allTransactions ?? {},
            sourcePolicyIDMap,
            targetPolicy: (duplicateTargetPolicy ?? undefined) as OnyxEntry<Policy>,
            targetPolicyCategories: targetPolicyCategories ?? {},
            targetPolicyTags: targetPolicyTags ?? {},
            targetReport: duplicateTargetReport,
            personalDetails,
            isASAPSubmitBetaEnabled,
            introSelected,
            quickAction,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            isSelfTourViewed,
            transactionDrafts,
            recentWaypoints,
            currentUser: {accountID, email: currentUserLogin ?? ''},
            currentUserLocalCurrency: localCurrencyCode ?? CONST.CURRENCY.USD,
            isTrackIntentUser,
            delegateAccountID,
            policyTagList,
            formatPhoneNumber,
            participantsPolicyTags,
            conciergeChat,
            rules,
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
