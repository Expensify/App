import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';

import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {createNewReport} from '@libs/actions/Report';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, getPersonalDetailsForAccountID, getReportOrDraftReport, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isUnreportedManagedCardTransaction} from '@libs/TransactionUtils';

import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {PersonalDetails, Report, Transaction} from '@src/types/onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useMemo} from 'react';
import Onyx from 'react-native-onyx';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {currentSearchResults} = useSearchResultsContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    // Search-selected transactions are not in COLLECTION.TRANSACTION — extract from `selectedTransactions` directly.
    const transactions = Object.values(selectedTransactions)
        .map((transactionItem) => transactionItem.transaction)
        .filter((transaction): transaction is Transaction => !!transaction);
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const personalPolicy = usePersonalPolicy();
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReportID)}`);
    const hasPerDiemTransactions = useHasPerDiemTransactions(selectedTransactionsKeys);
    const managedCardTransactionID = transactions.find((transaction) => isUnreportedManagedCardTransaction(transaction))?.transactionID;
    const hasUnreportedManagedCardTransactions = !!managedCardTransactionID;
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
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
    const {policyForMovingExpensesID, shouldSelectPolicy, shouldNavigateToUpgradePath} = usePolicyForMovingExpenses(
        hasPerDiemTransactions,
        undefined,
        selectedReportPolicyID,
        hasUnreportedManagedCardTransactions,
    );
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

        const report = getReportOrDraftReport(reportIDWithOwner, undefined, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDWithOwner}`]);
        return report?.ownerAccountID;
    }, [selectedTransactions, selectedTransactionsKeys, allReports]);
    const targetOwnerPersonalDetails = useMemo(() => getPersonalDetailsForAccountID(targetOwnerAccountID, personalDetails) as PersonalDetails, [personalDetails, targetOwnerAccountID]);

    useEffect(() => {
        const snapshotData = currentSearchResults?.data;
        if (!snapshotData) {
            return;
        }

        const onyxUpdates: Array<{
            onyxMethod: typeof Onyx.METHOD.MERGE;
            key: `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;
            value: Report;
        }> = [];

        for (const key of Object.keys(snapshotData)) {
            if (!key.startsWith(ONYXKEYS.COLLECTION.REPORT) || key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) || key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS)) {
                continue;
            }

            const typedKey = key as `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;
            if (allReports?.[typedKey]) {
                continue;
            }

            const report = snapshotData[typedKey];
            if (report) {
                onyxUpdates.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: typedKey,
                    value: report,
                });
            }
        }

        if (onyxUpdates.length > 0) {
            Onyx.update(onyxUpdates);
        }
        // Hydration should only run once on mount using the initial snapshot data
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        const optimisticReport = createNewReport(
            targetOwnerPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            policyForMovingExpenses,
            betas,
            isTrackIntentUser,
            false,
            shouldDismissEmptyReportsConfirmation,
            {managedCardTransactionID},
        );
        const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${optimisticReport.reportID}`];
        const policyTagList = policyForMovingExpenses?.id ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyForMovingExpenses.id}`] : {};
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
                policyTagList,
                transactions,
                allTransactionViolation: transactionViolations,
                allReports,
                isTrackIntentUser,
                personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                selfDMReportActions,
            });
            clearSelectedTransactions();
        });
        Navigation.goBack();
    };

    const {handleCreateReport} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        if (shouldNavigateToUpgradePath && selectedTransactionsKeys.length > 0) {
            const firstTransactionID = selectedTransactionsKeys.at(0);
            if (firstTransactionID) {
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: CONST.IOU.ACTION.EDIT,
                        iouType: CONST.IOU.TYPE.SUBMIT,
                        transactionID: firstTransactionID,
                        reportID: selectedTransactions[firstTransactionID]?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID,
                        upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                    }),
                );
            }
            return;
        }

        if (shouldSelectPolicy) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true)));
            return;
        }
        if (shouldNavigateToUpgradePath) {
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.CREATE,
                    transactionID: generateReportID(),
                    reportID: generateReportID(),
                    upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                }),
            );
            return;
        }
        if (
            policyForMovingExpensesID &&
            policyForMovingExpenses &&
            shouldRestrictUserBillableActions(policyForMovingExpenses, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, session?.accountID ?? CONST.DEFAULT_NUMBER_ID)
        ) {
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
        const policyTagList = item?.policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${item.policyID}`] : {};
        changeTransactionsReport({
            transactionIDs: selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            newReport: destinationReport,
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            reportNextStep,
            policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
            policyTagList,
            transactions,
            allTransactionViolation: transactionViolations,
            allReports,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            selfDMReportActions,
        });
        Navigation.goBack(undefined, {afterTransition: clearSelectedTransactions});
    };

    const removeFromReport = () => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }
        const policyTagList = personalPolicyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${personalPolicyID}`] : {};
        changeTransactionsReport({
            transactionIDs: selectedTransactionsKeys,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`],
            policyTagList,
            transactions,
            allTransactionViolation: transactionViolations,
            allReports,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            selfDMReportActions,
        });
        clearSelectedTransactions();
        Navigation.goBack();
    };

    return (
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
            transactionPolicyID={selectedReportPolicyID}
            isPerDiemRequest={hasPerDiemTransactions}
            isUnreportedManagedCardTransaction={hasUnreportedManagedCardTransactions}
        />
    );
}

export default SearchTransactionsChangeReport;
