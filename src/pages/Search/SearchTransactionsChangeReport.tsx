import React, {useMemo} from 'react';
import {InteractionManager} from 'react-native';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {createNewReport} from '@libs/actions/Report';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
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

        // Prefer owner metadata attached to each selection (handles unreported expenses)
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

    const createReportForPolicy = () => {
        const optimisticReport = createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForMovingExpensesID);
        const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${optimisticReport.reportID}`];
        changeTransactionsReport(
            selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            session?.email ?? '',
            optimisticReport,
            policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined,
            reportNextStep,
            undefined,
        );
        clearSelectedTransactions();
        Navigation.goBack();
    };

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

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }

        const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${item.value}`];
        const destinationReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];
        changeTransactionsReport(
            selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            session?.email ?? '',
            destinationReport,
            allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            reportNextStep,
            allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
        );
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });

        Navigation.goBack();
    };

    const removeFromReport = () => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }
        changeTransactionsReport(selectedTransactionsKeys, isASAPSubmitBetaEnabled, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
        clearSelectedTransactions();
        Navigation.goBack();
    };

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
            />
        </>
    );
}

SearchTransactionsChangeReport.displayName = 'SearchTransactionsChangeReport';

export default SearchTransactionsChangeReport;
