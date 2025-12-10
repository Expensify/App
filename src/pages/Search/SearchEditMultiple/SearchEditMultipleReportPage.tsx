import React, {useCallback, useMemo} from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import {createNewReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ReportListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchEditMultipleReportPage() {
    const {selectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const session = useSession();
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;

    const firstTransactionKey = selectedTransactionsKeys.at(0);
    const firstTransactionReportID = firstTransactionKey ? selectedTransactions[firstTransactionKey]?.reportID : undefined;
    const selectedReportID =
        Object.values(selectedTransactions).every((transaction) => transaction.reportID === firstTransactionReportID) && firstTransactionReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
            ? firstTransactionReportID
            : undefined;
    const areAllTransactionsUnreported =
        selectedTransactionsKeys.length > 0 && selectedTransactionsKeys.every((transactionKey) => selectedTransactions[transactionKey]?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID);
    const targetOwnerAccountID = useMemo(() => {
        if (selectedTransactionsKeys.length === 0) {
            return undefined;
        }

        const ownerFromSelection = selectedTransactionsKeys.map((transactionKey) => selectedTransactions[transactionKey]?.ownerAccountID).find((ownerID) => typeof ownerID === 'number');
        if (ownerFromSelection !== undefined) {
            return ownerFromSelection;
        }

        const reportIDWithOwner = selectedTransactionsKeys
            .map((transactionKey) => selectedTransactions[transactionKey]?.reportID)
            .find((reportID) => reportID && reportID !== CONST.REPORT.UNREPORTED_REPORT_ID);

        if (!reportIDWithOwner) {
            return undefined;
        }

        const report = getReportOrDraftReport(reportIDWithOwner);
        return report?.ownerAccountID;
    }, [selectedTransactions, selectedTransactionsKeys]);

    const createReportForPolicy = useCallback(() => {
        const optimisticReport = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForMovingExpensesID);
        updateBulkEditDraftTransaction({
            reportID: optimisticReport.reportID,
        });
        Navigation.goBack();
    }, [currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForMovingExpensesID]);

    const {handleCreateReport, CreateReportConfirmationModal} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        if (shouldSelectPolicy) {
            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true));
            return;
        }
        if (policyForMovingExpensesID && shouldRestrictUserBillableActions(policyForMovingExpensesID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyForMovingExpensesID));
            return;
        }
        handleCreateReport();
    };

    const selectReport = useCallback((item: ReportListItem) => {
        updateBulkEditDraftTransaction({
            reportID: item.value,
        });
        Navigation.goBack();
    }, []);

    const removeFromReport = useCallback(() => {
        updateBulkEditDraftTransaction({
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        });
        Navigation.goBack();
    }, []);

    return (
        <>
            {CreateReportConfirmationModal}
            <IOURequestEditReportCommon
                backTo={undefined}
                transactionIDs={selectedTransactionsKeys}
                selectedReportID={selectedReportID}
                selectReport={selectReport}
                removeFromReport={removeFromReport}
                createReport={createReport}
                isEditing
                isUnreported={areAllTransactionsUnreported}
                targetOwnerAccountID={targetOwnerAccountID}
                isPerDiemRequest={false}
            />
        </>
    );
}

SearchEditMultipleReportPage.displayName = 'SearchEditMultipleReportPage';

export default SearchEditMultipleReportPage;
