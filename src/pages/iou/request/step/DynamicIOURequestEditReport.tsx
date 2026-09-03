import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';

import useChangeTransactionsReportReports from '@hooks/useChangeTransactionsReportReports';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useTransactionsByID from '@hooks/useTransactionsByID';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isManualDistanceRequest as isManualDistanceRequestUtil, isOdometerDistanceRequest as isOdometerDistanceRequestUtil, isUnreportedManagedCardTransaction} from '@libs/TransactionUtils';

import {createNewReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useMemo} from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type DynamicIOURequestEditReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_EDIT_REPORT>;

function DynamicIOURequestEditReport({route}: DynamicIOURequestEditReportProps) {
    const {reportID, action, shouldTurnOffSelectionMode, transactionID: transactionIDFromParams} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_EDIT_REPORT.path);
    const {selectedTransactionIDs} = useSearchSelectionContext();
    const transactionIDs = transactionIDFromParams ? [transactionIDFromParams] : selectedTransactionIDs;
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`);
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalPolicy = usePersonalPolicy();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const personalDetails = usePersonalDetails();
    const ownerPersonalDetails = useMemo(
        () => getPersonalDetailsForAccountID(selectedReport?.ownerAccountID, personalDetails) as PersonalDetails,
        [personalDetails, selectedReport?.ownerAccountID],
    );
    const [transactions] = useTransactionsByID(transactionIDs);
    const managedCardTransactionID = transactions.find((transaction) => isUnreportedManagedCardTransaction(transaction))?.transactionID;
    const hasUnreportedManagedCardTransactions = !!managedCardTransactionID;
    const hasPerDiemTransactions = useHasPerDiemTransactions(transactionIDs);

    // When moving an expense that belongs to another user, or when the selection includes per diem
    // transactions, use the policy of their report (or the transaction's policy as fallback) so the
    // selected workspace is preserved.
    // For the current user's own non-per-diem expenses, fall back to undefined to let the default workspace apply.
    const isOwnedByOther = selectedReport?.ownerAccountID !== currentUserPersonalDetails.accountID;
    const isOwnedByOtherOrHasPerDiem = isOwnedByOther || hasPerDiemTransactions;
    const targetExpensePolicyID = isOwnedByOtherOrHasPerDiem ? selectedReport?.policyID : undefined;
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions, undefined, targetExpensePolicyID, hasUnreportedManagedCardTransactions);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.email ?? '');
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const reports = useChangeTransactionsReportReports(transactions, selectedReport?.reportID);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReportID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const selectReport = (item: TransactionGroupListItem, report?: OnyxEntry<Report>) => {
        if (transactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissToSuperWideRHP();
            return;
        }

        const newReport = report ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];
        const policyTagList = item?.policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${item.policyID}`] : {};
        const reportsForCall = newReport?.reportID ? {[`${ONYXKEYS.COLLECTION.REPORT}${newReport.reportID}`]: newReport, ...reports} : reports;

        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport({
                transactionIDs,
                isASAPSubmitBetaEnabled,
                accountID: currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: currentUserPersonalDetails.email ?? '',
                newReport,
                policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
                policyTagList,
                transactions,
                allTransactionViolation: transactionViolations,
                reports: reportsForCall,
                isTrackIntentUser,
                personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                selfDMReportActions,
                delegateAccountID,
                getCurrencyDecimals,
                getCurrencySymbol,
            });
            turnOffMobileSelectionMode();
            clearSelectedTransactions(true);
        });

        Navigation.dismissToSuperWideRHP();
    };

    const removeFromReport = () => {
        if (!selectedReport || transactionIDs.length === 0) {
            return;
        }
        const policyTagList = personalPolicyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${personalPolicyID}`] : {};
        changeTransactionsReport({
            transactionIDs,
            isASAPSubmitBetaEnabled,
            accountID: currentUserPersonalDetails.accountID,
            email: currentUserPersonalDetails.email ?? '',
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`],
            policyTagList,
            transactions,
            allTransactionViolation: transactionViolations,
            reports,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            selfDMReportActions,
            delegateAccountID,
            getCurrencyDecimals,
            getCurrencySymbol,
        });
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissToSuperWideRHP();
    };

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!hasPerDiemTransactions && !hasUnreportedManagedCardTransactions && !policyForMovingExpenses?.id) {
            return;
        }

        const optimisticReport = createNewReport(
            ownerPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            policyForMovingExpenses,
            betas,
            isTrackIntentUser,
            getCurrencyDecimals,
            false,
            shouldDismissEmptyReportsConfirmation,
            {managedCardTransactionID},
        );
        selectReport(
            {
                value: optimisticReport.reportID,
                keyForList: optimisticReport.reportID,
                policyID: policyForMovingExpenses?.id,
            },
            {...optimisticReport, transactionCount: 0, unheldNonReimbursableTotal: 0},
        );
    };

    const {handleCreateReport} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        const restrictionPolicy = policyForMovingExpenses;
        if (
            restrictionPolicy &&
            shouldRestrictUserBillableActions(restrictionPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserPersonalDetails.accountID)
        ) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictionPolicy.id));
            return;
        }
        if (hasPerDiemTransactions) {
            handleCreateReport();
            return;
        }
        if (!hasPerDiemTransactions && !hasUnreportedManagedCardTransactions && !policyForMovingExpensesID && !shouldSelectPolicy) {
            return;
        }
        if (shouldSelectPolicy) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true)));
            return;
        }
        handleCreateReport();
    };

    return (
        <IOURequestEditReportCommon
            backTo={backPath}
            selectedReportID={reportID}
            transactionIDs={transactionIDs}
            isManualDistanceRequest={transactions.some(isManualDistanceRequestUtil)}
            isOdometerDistanceRequest={transactions.some(isOdometerDistanceRequestUtil)}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing={action === CONST.IOU.ACTION.EDIT}
            createReport={createReport}
            isPerDiemRequest={hasPerDiemTransactions}
            isUnreportedManagedCardTransaction={hasUnreportedManagedCardTransactions}
            transactionPolicyID={targetExpensePolicyID}
        />
    );
}

export default withWritableReportOrNotFound(DynamicIOURequestEditReport);
