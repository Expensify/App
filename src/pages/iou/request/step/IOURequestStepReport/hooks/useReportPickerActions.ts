import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';

import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useHydrateReportsFromSnapshot from '@hooks/useHydrateReportsFromSnapshot';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';

import {createNewReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getPersonalDetailsForAccountID, getReportOrDraftReport, isPolicyExpenseChat, isReportOutstanding} from '@libs/ReportUtils';
import {
    isDistanceRequest as isDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
    isOdometerDistanceRequest as isOdometerDistanceRequestUtil,
    isPerDiemRequest,
    isTimeRequest as isTimeRequestUtil,
    isUnreportedManagedCardTransaction as isUnreportedManagedCardTransactionUtil,
} from '@libs/TransactionUtils';

import type {IOURequestEditReportCommonProps} from '@pages/iou/request/step/IOURequestEditReportCommon';
import navigateAwayFromReportPicker from '@pages/iou/request/step/IOURequestStepReport/navigateAwayFromReportPicker';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import useCreateReportRestrictionCheck from './useCreateReportRestrictionCheck';
import usePerDiemPolicyData from './usePerDiemPolicyData';
import useReportSelectionActions from './useReportSelectionActions';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type UseReportPickerActionsParams = {
    /** The expense whose report is being picked */
    transaction: OnyxEntry<Transaction>;

    /** ID of that expense, from the route or the field row */
    transactionID: string;

    action: IOUAction;

    iouType: IOUType;

    /** The report the flow was opened from: the chat the expense is being created in, or the report it already sits on */
    reportIDFromRoute: string;

    /** Called once a pick is made or the list is dismissed: the page goes back, the anchored dropdown closes */
    goBack: () => void;

    /** Called before the picker navigates somewhere else, e.g. to pick a workspace for a new report. The anchored dropdown closes itself here, and the navigation waits for that close. */
    onNavigateAway?: () => void;

    /** Whether a regular pick writes only after the back transition, see `useReportSelectionActions`. The anchored dropdown writes straight away. */
    shouldWriteAfterTransition?: boolean;
};

/** The props the list needs that depend on the expense: everything but where the list is shown */
type ReportPickerListProps = Pick<
    IOURequestEditReportCommonProps,
    | 'selectReport'
    | 'transactionIDs'
    | 'isManualDistanceRequest'
    | 'isOdometerDistanceRequest'
    | 'isDistanceRequest'
    | 'selectedReportID'
    | 'selectedPolicyID'
    | 'transactionPolicyID'
    | 'removeFromReport'
    | 'isEditing'
    | 'isUnreported'
    | 'isPerDiemRequest'
    | 'isTimeRequest'
    | 'isUnreportedManagedCardTransaction'
    | 'createReport'
    | 'targetOwnerAccountID'
>;

type UseReportPickerActionsResult = {
    /** Props for `IOURequestEditReportCommon`, the report list */
    listProps: ReportPickerListProps;

    /** The report the flow was opened from, resolved from the saved reports or the drafts */
    reportOrDraftReport: OnyxEntry<Report>;
};

const getIOUActionsSelector = (actions: OnyxEntry<ReportActions>): Array<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> => {
    return Object.values(actions ?? {}).filter(isMoneyRequestAction);
};

/**
 * Everything the report list needs to know about the expense it picks a report for, and what a pick does to the
 * expense. Both the full-page selector and the anchored dropdown go through here, so a pick in either lands in the
 * same place.
 */
function useReportPickerActions({
    transaction,
    transactionID,
    action,
    iouType,
    reportIDFromRoute,
    goBack,
    onNavigateAway,
    shouldWriteAfterTransition = true,
}: UseReportPickerActionsParams): UseReportPickerActionsResult {
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [reportNameValuePair] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const participantReportID = transaction?.participants?.at(0)?.reportID;
    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const shouldUseTransactionReport = (!!transactionReport && isReportOutstanding(transactionReport, transactionReport?.policyID, rules, reportNameValuePair)) || isUnreported;
    const outstandingReportID = isPolicyExpenseChat(participantReport) ? participantReport?.iouReportID : participantReportID;
    const selectedReportID = shouldUseTransactionReport ? transactionReport?.reportID : outstandingReportID;
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`);
    const {allPolicies, perDiemOriginalPolicy} = usePerDiemPolicyData(transaction);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const {setSelectedTransactions} = useSearchSelectionActions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const {currentSearchResults} = useSearchResultsContext();
    useHydrateReportsFromSnapshot(currentSearchResults, allReports);
    const reportOrDraftReport = useReportOrReportDraft(reportIDFromRoute);
    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportOrDraftReport?.parentReportID}`, {selector: getIOUActionsSelector});
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreateReport = action === CONST.IOU.ACTION.CREATE;
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const ownerAccountID = isUnreported
        ? iouActions?.find((iouAction) => getOriginalMessage(iouAction)?.IOUTransactionID === transaction.transactionID)?.actorAccountID
        : selectedReport?.ownerAccountID;
    const ownerPersonalDetails: CurrentUserPersonalDetails = {...getPersonalDetailsForAccountID(ownerAccountID, personalDetails), accountID: ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const isPerDiemTransaction = isPerDiemRequest(transaction);
    const isUnreportedManagedCardTransaction = isUnreportedManagedCardTransactionUtil(transaction);

    const transactionPolicyID = transaction?.participants?.at(0)?.isPolicyExpenseChat ? transaction?.participants.at(0)?.policyID : undefined;
    // When moving an expense that belongs to another user, or when the selection includes per diem
    // transactions, use the policy of their report (or the transaction's policy as fallback) so the
    // selected workspace is preserved.
    // For the current user's own non-per-diem expenses, fall back to undefined to let the default workspace apply.
    const targetExpensePolicyID = ownerAccountID !== session?.accountID || isPerDiemTransaction ? (selectedReport?.policyID ?? transactionPolicyID) : undefined;

    // we need to fall back to transactionPolicyID because for a new workspace there is no report created yet
    // and if we choose this workspace as participant we want to create a new report in the chosen workspace
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(
        isPerDiemTransaction,
        isTimeRequestUtil(transaction),
        targetExpensePolicyID,
        isUnreportedManagedCardTransaction,
    );

    // No violations exist for a report that hasn't been created yet — kept as a literal to avoid subscribing to the entire TRANSACTION_VIOLATIONS collection.
    const hasViolations = false;
    const [policyForMovingExpenses] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`);
    const [transactions] = useOptimisticDraftTransactions(transaction);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {getCurrencyDecimals} = useCurrencyListActions();
    const isCreateReportRestricted = useCreateReportRestrictionCheck(session);

    const {handleGlobalCreateReport, handleRegularReportSelection, removeFromReport} = useReportSelectionActions({
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
        handleGoBack: goBack,
        shouldWriteAfterTransition,
    });

    const selectReport = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }
        const isSameReport = item.value === transaction.reportID;

        // Early return for same report selection
        if (isSameReport) {
            goBack();
            return;
        }

        // Handle global create report
        if (isCreateReport && isFromGlobalCreate) {
            handleGlobalCreateReport(item);
            return;
        }

        const report = getReportOrDraftReport(item.value);
        // Handle regular report selection
        handleRegularReportSelection(item, report);
    };

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!isPerDiemTransaction && !isUnreportedManagedCardTransaction && !policyForMovingExpenses?.id) {
            return;
        }

        const policyForNewReport = isPerDiemTransaction && perDiemOriginalPolicy ? perDiemOriginalPolicy : policyForMovingExpenses;
        const optimisticReport = createNewReport(
            ownerPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            policyForNewReport,
            isTrackIntentUser,
            getCurrencyDecimals,
            rules,
            false,
            shouldDismissEmptyReportsConfirmation,
            {managedCardTransactionID: isUnreportedManagedCardTransaction ? transactionID : undefined},
        );
        handleRegularReportSelection({value: optimisticReport.reportID, keyForList: optimisticReport.reportID, policyID: policyForNewReport?.id}, optimisticReport);
    };

    const {handleCreateReport} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        const restrictionPolicy = isPerDiemTransaction ? perDiemOriginalPolicy : policyForMovingExpenses;
        if (restrictionPolicy && isCreateReportRestricted(restrictionPolicy)) {
            navigateAwayFromReportPicker(ROUTES.RESTRICTED_ACTION.getRoute(restrictionPolicy.id), onNavigateAway);
            return;
        }
        if (isPerDiemTransaction) {
            handleCreateReport();
            return;
        }
        if (!isPerDiemTransaction && !isUnreportedManagedCardTransaction && !policyForMovingExpensesID && !shouldSelectPolicy) {
            return;
        }
        if (shouldSelectPolicy) {
            setSelectedTransactions([transactionID]);
            navigateAwayFromReportPicker(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true)), onNavigateAway);
            return;
        }
        handleCreateReport();
    };

    let selectedPolicyID;
    if (isPerDiemTransaction) {
        selectedPolicyID = isFromGlobalCreate ? undefined : perDiemOriginalPolicy?.id;
    } else {
        selectedPolicyID = !isEditing && !isFromGlobalCreate ? reportOrDraftReport?.policyID : undefined;
    }

    return {
        reportOrDraftReport,
        listProps: {
            selectReport,
            transactionIDs: transaction ? [transaction.transactionID] : [],
            isManualDistanceRequest: transactions.some(isManualDistanceRequestUtil),
            isOdometerDistanceRequest: transactions.some(isOdometerDistanceRequestUtil),
            isDistanceRequest: transactions.some(isDistanceRequestUtil),
            selectedReportID,
            selectedPolicyID,
            transactionPolicyID: targetExpensePolicyID,
            removeFromReport,
            isEditing,
            isUnreported,
            isPerDiemRequest: transaction ? isPerDiemTransaction : false,
            isTimeRequest: transaction ? isTimeRequestUtil(transaction) : false,
            isUnreportedManagedCardTransaction: transaction ? isUnreportedManagedCardTransaction : false,
            createReport: policyForMovingExpensesID || shouldSelectPolicy || isPerDiemTransaction || isUnreportedManagedCardTransaction ? createReport : undefined,
            targetOwnerAccountID: ownerAccountID,
        },
    };
}

export default useReportPickerActions;
export type {ReportPickerListProps};
