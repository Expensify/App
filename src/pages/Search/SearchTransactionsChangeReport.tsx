import React, {useMemo} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {createNewReport} from '@libs/actions/Report';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountID, getReportOrDraftReport, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails, Transaction} from '@src/types/onyx';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const transactions = useMemo(
        () =>
            Object.values(selectedTransactions).reduce(
                (transactionsCollection, transactionItem) => {
                    // eslint-disable-next-line no-param-reassign
                    transactionsCollection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transaction.transactionID}`] = transactionItem.transaction;
                    return transactionsCollection;
                },
                {} as NonNullable<OnyxCollection<Transaction>>,
            ),
        [selectedTransactions],
    );
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`, {canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const hasPerDiemTransactions = useHasPerDiemTransactions(selectedTransactionsKeys);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const firstTransactionKey = selectedTransactionsKeys.at(0);
    const firstTransactionReportID = firstTransactionKey ? selectedTransactions[firstTransactionKey]?.reportID : undefined;
    const selectedReportID =
        Object.values(selectedTransactions).every((transaction) => transaction.reportID === firstTransactionReportID) && firstTransactionReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
            ? firstTransactionReportID
            : undefined;
    // Get the policyID from the selected transactions' report to pass to usePolicyForMovingExpenses
    // This ensures the "Create report" button shows the correct workspace instead of the user's default
    const selectedReportPolicyID = selectedReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`]?.policyID : undefined;
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions, selectedReportPolicyID);
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
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
    const targetOwnerPersonalDetails = useMemo(() => getPersonalDetailsForAccountID(targetOwnerAccountID, personalDetails) as PersonalDetails, [personalDetails, targetOwnerAccountID]);
    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        const optimisticReport = createNewReport(
            targetOwnerPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            policyForMovingExpenses,
            betas,
            false,
            shouldDismissEmptyReportsConfirmation,
        );
        const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${optimisticReport.reportID}`];
        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport({
                transactionIDs: selectedTransactionsKeys,
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                newReport: optimisticReport,
                policy: policyForMovingExpenses,
                reportNextStep,
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyForMovingExpensesID}`],
                allTransactions: transactions,
            });
            clearSelectedTransactions();
        });
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
        changeTransactionsReport({
            transactionIDs: selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            newReport: destinationReport,
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            reportNextStep,
            policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
            allTransactions: transactions,
        });
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
        changeTransactionsReport({
            transactionIDs: selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            allTransactions: transactions,
        });
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
                isPerDiemRequest={hasPerDiemTransactions}
            />
        </>
    );
}

export default SearchTransactionsChangeReport;
