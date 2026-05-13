// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useOnyx from '@hooks/useOnyx';
import {setCustomUnitID, setCustomUnitRateID} from '@libs/actions/IOU';
import {clearSubrates} from '@libs/actions/IOU/PerDiem';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, Session, Transaction} from '@src/types/onyx';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type UseReportSelectionActionsParams = {
    /** The transaction being moved/assigned. */
    transaction: OnyxEntry<Transaction>;

    /** The optimistic-draft transaction list — used in the global-create flow to update every draft together. */
    transactions: Transaction[];

    /** The full POLICY collection — needed for callback-time lookups by user-selected policyID. */
    allPolicies: OnyxCollection<Policy>;

    /** The per-diem policy derived from the transaction's custom-unit ID — used to detect policy changes for per-diem flows. */
    perDiemOriginalPolicy: OnyxEntry<Policy>;

    /** True when the transaction is per-diem — triggers subrate clearing on policy change. */
    isPerDiemTransaction: boolean;

    /** True when editing an existing expense (vs. creating a new one). */
    isEditing: boolean;

    /** True when the ASAP-submit beta is enabled. */
    isASAPSubmitBetaEnabled: boolean;

    /** Current user session — provides accountID and email for the changeTransactionsReport call. */
    session: OnyxEntry<Session>;

    /** Route param: the transactionID being acted upon. */
    transactionID: string;

    /** Type of IOU flow (request, split, track, etc.). */
    iouType: IOUType;

    /** Route param: the IOU action (create / edit). */
    action: IOUAction;

    /** Route param: the originating reportID — fallback for the destination route on policy change. */
    reportIDFromRoute: string;

    /** ID of the user's personal policy — used by `removeFromReport` to look up the personal-policy tag list. */
    personalPolicyID: string | undefined;

    /** Optional route to return to instead of the default back navigation. */
    backTo: string | undefined;

    /** Caller-provided back-navigation handler — `handleRegularReportSelection` calls this before scheduling the change. */
    handleGoBack: () => void;
};

type UseReportSelectionActionsResult = {
    /** Handler invoked when the user picks a report from the global-create flow (changes report + may navigate to destination step on policy change). */
    handleGlobalCreateReport: (item: TransactionGroupListItem) => void;

    /** Handler invoked for ordinary report selection — schedules the change after the back animation. */
    handleRegularReportSelection: (item: TransactionGroupListItem, report: OnyxEntry<Report>) => void;

    /** Handler invoked when the user opts to remove the expense from its current report (moves it to the personal policy). */
    removeFromReport: () => void;
};

function useReportSelectionActions({
    transaction,
    transactions,
    allPolicies,
    perDiemOriginalPolicy,
    isPerDiemTransaction,
    isEditing,
    isASAPSubmitBetaEnabled,
    session,
    transactionID,
    iouType,
    action,
    reportIDFromRoute,
    personalPolicyID,
    backTo,
    handleGoBack,
}: UseReportSelectionActionsParams): UseReportSelectionActionsResult {
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const {removeTransaction} = useSearchActionsContext();

    const buildParticipants = (report: OnyxEntry<Report>) => [
        {
            selected: true,
            accountID: 0,
            isPolicyExpenseChat: true,
            reportID: report?.chatReportID,
            policyID: report?.policyID,
        },
    ];

    const handleGlobalCreateReport = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }
        const reportOrDraftReportFromValue = getReportOrDraftReport(item.value, undefined, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`]);
        const participants = buildParticipants(reportOrDraftReportFromValue);

        const currentPolicyID = perDiemOriginalPolicy?.id;
        const newPolicyID = reportOrDraftReportFromValue?.policyID;
        const policyChanged = currentPolicyID && newPolicyID && currentPolicyID !== newPolicyID;

        const newPolicy = newPolicyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${newPolicyID}`] : undefined;
        const newPerDiemCustomUnit = getPerDiemCustomUnit(newPolicy);
        const newCustomUnitID = newPerDiemCustomUnit?.customUnitID;

        for (const transactionItem of transactions) {
            setTransactionReport(
                transactionItem.transactionID,
                {
                    reportID: item.value,
                    participants,
                },
                true,
            );
        }

        // Clear subrates, and update customUnitID if policy changed for per diem transactions
        if (policyChanged && isPerDiemTransaction) {
            setCustomUnitID(transaction.transactionID, newCustomUnitID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID);
            setCustomUnitRateID(transaction.transactionID, undefined, transaction, newPolicy);
            clearSubrates(transaction.transactionID);

            const newChatReportID = reportOrDraftReportFromValue?.chatReportID ?? reportIDFromRoute;
            const destinationRoute = ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, newChatReportID);
            Navigation.goBack(destinationRoute, {compareParams: false});
            return;
        }

        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportOrDraftReportFromValue?.chatReportID);
        // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
        if (backTo) {
            Navigation.goBack(iouConfirmationPageRoute, {compareParams: false});
        } else {
            Navigation.navigate(iouConfirmationPageRoute);
        }
    };

    const handleRegularReportSelection = (item: TransactionGroupListItem, report: OnyxEntry<Report>) => {
        if (!transaction) {
            return;
        }

        handleGoBack();
        InteractionManager.runAfterInteractions(() => {
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                const participants = buildParticipants(report);

                setTransactionReport(
                    transaction.transactionID,
                    {
                        reportID: item.value,
                        participants,
                    },
                    !isEditing,
                );

                if (isEditing) {
                    const policyTagList = item?.policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${item.policyID}`] : {};
                    changeTransactionsReport({
                        transactionIDs: [transaction.transactionID],
                        isASAPSubmitBetaEnabled,
                        accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        email: session?.email ?? '',
                        newReport: report,
                        policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                        reportNextStep: undefined,
                        policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
                        allTransactions,
                        policyTagList,
                    });
                    removeTransaction(transaction.transactionID);
                }
            });
        });
    };

    const removeFromReport = () => {
        if (!transaction) {
            return;
        }
        Navigation.dismissToSuperWideRHP();
        InteractionManager.runAfterInteractions(() => {
            const policyTagList = personalPolicyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${personalPolicyID}`] : {};
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`],
                allTransactions,
                policyTagList,
            });
            removeTransaction(transaction.transactionID);
        });
    };

    return {handleGlobalCreateReport, handleRegularReportSelection, removeFromReport};
}

export default useReportSelectionActions;
