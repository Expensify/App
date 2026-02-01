import React, {useMemo} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import {clearSubrates, setCustomUnitID, setCustomUnitRateID} from '@libs/actions/IOU';
import {createNewReport} from '@libs/actions/Report';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit, getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getPersonalDetailsForAccountID, getReportOrDraftReport, hasViolations as hasViolationsReportUtils, isPolicyExpenseChat, isReportOutstanding} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Report, ReportAction, ReportActions} from '@src/types/onyx';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
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
    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`, {canBeMissing: false});
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const transactionReport = Object.values(allReports ?? {}).find((report) => report?.reportID === transaction?.reportID);
    const participantReportID = transaction?.participants?.at(0)?.reportID;
    const participantReport = Object.values(allReports ?? {}).find((report) => report?.reportID === participantReportID);
    const shouldUseTransactionReport = (!!transactionReport && isReportOutstanding(transactionReport, transactionReport?.policyID)) || isUnreported;
    const outstandingReportID = isPolicyExpenseChat(participantReport) ? participantReport?.iouReportID : participantReportID;
    const selectedReportID = shouldUseTransactionReport ? transactionReport?.reportID : outstandingReportID;
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const {removeTransaction, setSelectedTransactions} = useSearchContext();
    const reportOrDraftReport = getReportOrDraftReport(reportIDFromRoute);
    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportOrDraftReport?.parentReportID}`, {canBeMissing: true, selector: getIOUActionsSelector});
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreateReport = action === CONST.IOU.ACTION.CREATE;
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const ownerAccountID = useMemo(() => {
        if (isUnreported) {
            return iouActions?.find((iouAction) => getOriginalMessage(iouAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>)?.IOUTransactionID === transaction.transactionID)
                ?.actorAccountID;
        }
        return selectedReport?.ownerAccountID;
    }, [isUnreported, selectedReport?.ownerAccountID, iouActions, transaction?.transactionID]);
    const ownerPersonalDetails = useMemo(() => getPersonalDetailsForAccountID(ownerAccountID, personalDetails) as PersonalDetails, [personalDetails, ownerAccountID]);
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(isPerDiemRequest(transaction));
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);
    const isPerDiemTransaction = isPerDiemRequest(transaction);
    const perDiemOriginalPolicy = getPolicyByCustomUnitID(transaction, allPolicies);
    const [transactions] = useOptimisticDraftTransactions(transaction);
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const handleGoBack = () => {
        if (isEditing) {
            Navigation.dismissToSuperWideRHP();
        } else {
            Navigation.goBack(backTo);
        }
    };

    const handleGlobalCreateReport = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }
        const reportOrDraftReportFromValue = getReportOrDraftReport(item.value);
        const participants = [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: reportOrDraftReportFromValue?.chatReportID,
                policyID: reportOrDraftReportFromValue?.policyID,
            },
        ];

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
            setCustomUnitRateID(transaction.transactionID, undefined);
            clearSubrates(transaction.transactionID);
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setTransactionReport(
                transaction.transactionID,
                {
                    reportID: item.value,
                },
                !isEditing,
            );

            if (isEditing) {
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
                });
                removeTransaction(transaction.transactionID);
            }
        });
    };

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

        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];
        // Handle regular report selection
        handleRegularReportSelection(item, report);
    };

    const removeFromReport = () => {
        if (!transaction) {
            return;
        }
        Navigation.dismissToSuperWideRHP();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            changeTransactionsReport({
                transactionIDs: [transaction.transactionID],
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                allTransactions,
            });
            removeTransaction(transaction.transactionID);
        });
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, reportOrDraftReport, transaction);

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!isPerDiemTransaction && !policyForMovingExpenses?.id) {
            return;
        }

        const policyForNewReport = isPerDiemTransaction && perDiemOriginalPolicy ? perDiemOriginalPolicy : policyForMovingExpenses;
        const optimisticReport = createNewReport(ownerPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForNewReport, betas, false, shouldDismissEmptyReportsConfirmation);
        handleRegularReportSelection({value: optimisticReport.reportID}, optimisticReport);
    };

    const {handleCreateReport, CreateReportConfirmationModal} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
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
        if (policyForMovingExpensesID && shouldRestrictUserBillableActions(policyForMovingExpensesID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyForMovingExpensesID));
            return;
        }
        handleCreateReport();
    };

    let selectedPolicyID;
    if (isPerDiemTransaction) {
        selectedPolicyID = perDiemOriginalPolicy?.id;
    } else {
        selectedPolicyID = !isEditing && !isFromGlobalCreate ? reportOrDraftReport?.policyID : undefined;
    }

    return (
        <>
            {CreateReportConfirmationModal}
            <IOURequestEditReportCommon
                backTo={backTo}
                selectReport={selectReport}
                transactionIDs={transaction ? [transaction.transactionID] : []}
                selectedReportID={selectedReportID}
                selectedPolicyID={selectedPolicyID}
                removeFromReport={removeFromReport}
                isEditing={isEditing}
                isUnreported={isUnreported}
                shouldShowNotFoundPage={shouldShowNotFoundPage}
                isPerDiemRequest={transaction ? isPerDiemRequest(transaction) : false}
                createReport={action === CONST.IOU.ACTION.EDIT && (policyForMovingExpensesID || shouldSelectPolicy || isPerDiemTransaction) ? createReport : undefined}
                targetOwnerAccountID={ownerAccountID}
            />
        </>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
