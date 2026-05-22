import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import {createNewReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getPersonalDetailsForAccountID, getReportOrDraftReport, isPolicyExpenseChat, isReportOutstanding} from '@libs/ReportUtils';
import {isPerDiemRequest, isTimeRequest as isTimeRequestUtil} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, ReportAction, ReportActions} from '@src/types/onyx';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import useCreateReportRestrictionCheck from './IOURequestStepReport/hooks/useCreateReportRestrictionCheck';
import usePerDiemPolicyData from './IOURequestStepReport/hooks/usePerDiemPolicyData';
import useReportSelectionActions from './IOURequestStepReport/hooks/useReportSelectionActions';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestStepReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT>;

const getIOUActionsSelector = (actions: OnyxEntry<ReportActions>): ReportAction[] => {
    return Object.values(actions ?? {}).filter(isMoneyRequestAction);
};

function IOURequestStepReport({route, transaction}: IOURequestStepReportProps) {
    const {backTo, action, iouType, transactionID, reportID: reportIDFromRoute, reportActionID} = route.params;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const participantReportID = transaction?.participants?.at(0)?.reportID;
    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`);
    const shouldUseTransactionReport = (!!transactionReport && isReportOutstanding(transactionReport, transactionReport?.policyID)) || isUnreported;
    const outstandingReportID = isPolicyExpenseChat(participantReport) ? participantReport?.iouReportID : participantReportID;
    const selectedReportID = shouldUseTransactionReport ? transactionReport?.reportID : outstandingReportID;
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`);
    const {allPolicies, perDiemOriginalPolicy} = usePerDiemPolicyData(transaction);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const {setSelectedTransactions} = useSearchActionsContext();
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
        ? iouActions?.find((iouAction) => getOriginalMessage(iouAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>)?.IOUTransactionID === transaction.transactionID)?.actorAccountID
        : selectedReport?.ownerAccountID;
    const ownerPersonalDetails = getPersonalDetailsForAccountID(ownerAccountID, personalDetails) as PersonalDetails;
    const isPerDiemTransaction = isPerDiemRequest(transaction);

    const transactionPolicyID = transaction?.participants?.at(0)?.isPolicyExpenseChat ? transaction?.participants.at(0)?.policyID : undefined;
    // When moving an expense that belongs to another user, or when the selection includes per diem
    // transactions, use the policy of their report (or the transaction's policy as fallback) so the
    // selected workspace is preserved.
    // For the current user's own non-per-diem expenses, fall back to undefined to let the default workspace apply.
    const targetExpensePolicyID = ownerAccountID !== session?.accountID || isPerDiemTransaction ? (selectedReport?.policyID ?? transactionPolicyID) : undefined;

    // we need to fall back to transactionPolicyID because for a new workspace there is no report created yet
    // and if we choose this workspace as participant we want to create a new report in the chosen workspace
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(isPerDiemTransaction, isTimeRequestUtil(transaction), targetExpensePolicyID);

    // No violations exist for a report that hasn't been created yet — kept as a literal to avoid subscribing to the entire TRANSACTION_VIOLATIONS collection.
    const hasViolations = false;
    const [policyForMovingExpenses] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`);
    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);
    const [transactions] = useOptimisticDraftTransactions(transaction);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const isCreateReportRestricted = useCreateReportRestrictionCheck(session);
    const handleGoBack = () => {
        if (isEditing) {
            Navigation.dismissToSuperWideRHP();
        } else {
            Navigation.goBack(backTo);
        }
    };

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
        backTo,
        handleGoBack,
    });

    const selectReport = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }
        const isSameReport = item.value === transaction.reportID;

        // Early return for same report selection
        if (isSameReport) {
            handleGoBack();
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

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, reportOrDraftReport, transaction);

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!isPerDiemTransaction && !policyForMovingExpenses?.id) {
            return;
        }

        const policyForNewReport = isPerDiemTransaction && perDiemOriginalPolicy ? perDiemOriginalPolicy : policyForMovingExpenses;
        const optimisticReport = createNewReport(ownerPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForNewReport, betas, false, shouldDismissEmptyReportsConfirmation);
        handleRegularReportSelection({value: optimisticReport.reportID, keyForList: optimisticReport.reportID}, optimisticReport);
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
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictionPolicy.id));
            return;
        }
        if (isPerDiemTransaction) {
            handleCreateReport();
            return;
        }
        if (!isPerDiemTransaction && !policyForMovingExpensesID && !shouldSelectPolicy) {
            return;
        }
        if (shouldSelectPolicy) {
            setSelectedTransactions([transactionID]);
            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true, backTo));
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

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            selectReport={selectReport}
            transactionIDs={transaction ? [transaction.transactionID] : []}
            selectedReportID={selectedReportID}
            selectedPolicyID={selectedPolicyID}
            transactionPolicyID={targetExpensePolicyID}
            removeFromReport={removeFromReport}
            isEditing={isEditing}
            isUnreported={isUnreported}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            isPerDiemRequest={transaction ? isPerDiemTransaction : false}
            isTimeRequest={transaction ? isTimeRequestUtil(transaction) : false}
            createReport={policyForMovingExpensesID || shouldSelectPolicy || isPerDiemTransaction ? createReport : undefined}
            targetOwnerAccountID={ownerAccountID}
        />
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
