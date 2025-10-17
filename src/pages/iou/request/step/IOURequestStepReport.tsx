import React from 'react';
import {InteractionManager} from 'react-native';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import {createNewReport} from '@libs/actions/Report';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {getReportOrDraftReport, hasViolations as hasViolationsReportUtils, isPolicyExpenseChat, isReportOutstanding} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const {removeTransaction, setSelectedTransactions} = useSearchContext();
    const reportOrDraftReport = getReportOrDraftReport(reportIDFromRoute);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreateReport = action === CONST.IOU.ACTION.CREATE;
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const session = useSession();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);
    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);

    const handleGoBack = () => {
        if (isEditing) {
            Navigation.dismissModal();
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

        setTransactionReport(
            transaction.transactionID,
            {
                reportID: item.value,
                participants,
            },
            true,
        );

        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportOrDraftReportFromValue?.chatReportID);
        // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
        if (backTo) {
            Navigation.goBack(iouConfirmationPageRoute, {compareParams: false});
        } else {
            Navigation.navigate(iouConfirmationPageRoute);
        }
    };

    const handleRegularReportSelection = (item: TransactionGroupListItem) => {
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
                changeTransactionsReport(
                    [transaction.transactionID],
                    item.value,
                    isASAPSubmitBetaEnabled,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                    undefined,
                    allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
                );
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

        // Handle regular report selection
        handleRegularReportSelection(item);
    };

    const removeFromReport = () => {
        if (!transaction) {
            return;
        }
        Navigation.dismissModal();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            changeTransactionsReport(
                [transaction.transactionID],
                CONST.REPORT.UNREPORTED_REPORT_ID,
                isASAPSubmitBetaEnabled,
                session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                session?.email ?? '',
            );
            removeTransaction(transaction.transactionID);
        });
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, reportOrDraftReport, transaction);

    const createReport = () => {
        if (!policyForMovingExpensesID && !shouldSelectPolicy) {
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
        const createdReportID = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForMovingExpensesID);
        handleRegularReportSelection({value: createdReportID});
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            selectReport={selectReport}
            transactionIDs={transaction ? [transaction.transactionID] : []}
            selectedReportID={selectedReportID}
            selectedPolicyID={!isEditing && !isFromGlobalCreate ? reportOrDraftReport?.policyID : undefined}
            removeFromReport={removeFromReport}
            isEditing={isEditing}
            isUnreported={isUnreported}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            isPerDiemRequest={transaction ? isPerDiemRequest(transaction) : false}
            createReport={action === CONST.IOU.ACTION.EDIT ? createReport : undefined}
        />
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
