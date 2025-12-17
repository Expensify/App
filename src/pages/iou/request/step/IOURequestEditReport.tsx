import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {createNewReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestEditReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.EDIT_REPORT>;

function IOURequestEditReport({route}: IOURequestEditReportProps) {
    const {backTo, reportID, action, shouldTurnOffSelectionMode} = route.params;

    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();
    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`, {canBeMissing: false});
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const hasPerDiemTransactions = useHasPerDiemTransactions(selectedTransactionIDs);

    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;

    const selectReport = (item: TransactionGroupListItem, report?: OnyxEntry<Report>) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissModal();
            return;
        }

        const newReport = report ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];

        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport(
                selectedTransactionIDs,
                isASAPSubmitBetaEnabled,
                session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                session?.email ?? '',
                newReport,
                allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                reportNextStep,
                allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
            );
            turnOffMobileSelectionMode();
            clearSelectedTransactions(true);
        });

        Navigation.dismissModal();
    };

    const removeFromReport = () => {
        if (!selectedReport || selectedTransactionIDs.length === 0) {
            return;
        }
        changeTransactionsReport(selectedTransactionIDs, isASAPSubmitBetaEnabled, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissModal();
    };

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!hasPerDiemTransactions && !policyForMovingExpensesID) {
            return;
        }

        const policyForNewReportID = hasPerDiemTransactions ? selectedReport?.policyID : policyForMovingExpensesID;
        const optimisticReport = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForNewReportID, false, shouldDismissEmptyReportsConfirmation);
        selectReport({value: optimisticReport.reportID}, optimisticReport);
    };

    const {handleCreateReport, CreateReportConfirmationModal} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        if (hasPerDiemTransactions) {
            handleCreateReport();
            return;
        }
        if (!hasPerDiemTransactions && !policyForMovingExpensesID && !shouldSelectPolicy) {
            return;
        }
        if (shouldSelectPolicy) {
            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true, backTo));
            return;
        }
        if (policyForMovingExpensesID && shouldRestrictUserBillableActions(policyForMovingExpensesID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyForMovingExpensesID));
            return;
        }
        handleCreateReport();
    };

    return (
        <>
            {CreateReportConfirmationModal}
            <IOURequestEditReportCommon
                backTo={backTo}
                selectedReportID={reportID}
                transactionIDs={selectedTransactionIDs}
                selectReport={selectReport}
                removeFromReport={removeFromReport}
                isEditing={action === CONST.IOU.ACTION.EDIT}
                createReport={createReport}
                isPerDiemRequest={hasPerDiemTransactions}
            />
        </>
    );
}

IOURequestEditReport.displayName = 'IOURequestEditReport';

export default withWritableReportOrNotFound(IOURequestEditReport);
