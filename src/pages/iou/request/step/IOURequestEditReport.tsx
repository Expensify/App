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

    const {selectedTransactionIDs, clearAllSelectedTransactions} = useSearchContext();
    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`, {canBeMissing: false});
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const selectedReportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport?.policyID}`];

    const hasPerDiemTransactions = useHasPerDiemTransactions(selectedTransactionIDs);

    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});

    const selectReport = (item: TransactionGroupListItem, report?: OnyxEntry<Report>) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissToSuperWideRHP();
            return;
        }

        const newReport = report ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];

        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport({
                transactionIDs: selectedTransactionIDs,
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                newReport,
                policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                reportNextStep,
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
                allTransactions,
            });
            turnOffMobileSelectionMode();
            clearAllSelectedTransactions();
        });

        Navigation.dismissToSuperWideRHP();
    };

    const removeFromReport = () => {
        if (!selectedReport || selectedTransactionIDs.length === 0) {
            return;
        }
        changeTransactionsReport({
            transactionIDs: selectedTransactionIDs,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            allTransactions,
        });
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearAllSelectedTransactions();
        Navigation.dismissToSuperWideRHP();
    };

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!hasPerDiemTransactions && !policyForMovingExpenses?.id) {
            return;
        }

        const policyForNewReport = hasPerDiemTransactions ? selectedReportPolicy : policyForMovingExpenses;
        const optimisticReport = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForNewReport, false, shouldDismissEmptyReportsConfirmation);
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

export default withWritableReportOrNotFound(IOURequestEditReport);
