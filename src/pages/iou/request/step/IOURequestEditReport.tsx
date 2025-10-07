import React from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
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
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const session = useSession();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissModal();
            return;
        }

        changeTransactionsReport(
            selectedTransactionIDs,
            item.value,
            isASAPSubmitBetaEnabled,
            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            session?.email ?? '',
            allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            reportNextStep,
            allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
        );
        turnOffMobileSelectionMode();
        clearSelectedTransactions(true);
        Navigation.dismissModal();
    };

    const removeFromReport = () => {
        if (!selectedReport || selectedTransactionIDs.length === 0) {
            return;
        }
        changeTransactionsReport(selectedTransactionIDs, CONST.REPORT.UNREPORTED_REPORT_ID, isASAPSubmitBetaEnabled, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissModal();
    };

    const createReport = () => {
        const createdReportID = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForMovingExpensesID);
        const backToRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID});
        if (shouldSelectPolicy) {
            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true, backToRoute));
            return;
        }
        selectReport({value: createdReportID});
        Navigation.navigate(backToRoute, {forceReplace: true});
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
        />
    );
}

IOURequestEditReport.displayName = 'IOURequestEditReport';

export default withWritableReportOrNotFound(IOURequestEditReport);
