import React, {useMemo} from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';
import {createNewReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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

    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const hasPerDiemTransactions = useMemo(() => {
        return selectedTransactionIDs.some((transactionID) => {
            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            return transaction && isPerDiemRequest(transaction);
        });
    }, [selectedTransactionIDs, allTransactions]);

    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissModal();
            return;
        }

        changeTransactionsReport({
            transactionIDs: selectedTransactionIDs,
            reportID: item.value,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            reportNextStep,
            policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
            allReportsCollection: allReports,
            allTransactionsCollection: allTransactions,
            allTransactionViolationsCollection: transactionViolations,
        });
        turnOffMobileSelectionMode();
        clearSelectedTransactions(true);
        Navigation.dismissModal();
    };

    const removeFromReport = () => {
        if (!selectedReport || selectedTransactionIDs.length === 0) {
            return;
        }

        changeTransactionsReport({
            transactionIDs: selectedTransactionIDs,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            allReportsCollection: allReports,
            allTransactionsCollection: allTransactions,
            allTransactionViolationsCollection: transactionViolations,
        });
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissModal();
    };

    const createReport = () => {
        if (!policyForMovingExpensesID && !shouldSelectPolicy) {
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
        const createdReportID = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForMovingExpensesID);
        selectReport({value: createdReportID});
    };

    return (
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
    );
}

IOURequestEditReport.displayName = 'IOURequestEditReport';

export default withWritableReportOrNotFound(IOURequestEditReport);
