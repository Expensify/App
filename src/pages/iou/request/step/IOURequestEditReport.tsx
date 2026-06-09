import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasPerDiemTransactions from '@hooks/useHasPerDiemTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useTransactionsByID from '@hooks/useTransactionsByID';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {createNewReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Report, Transaction} from '@src/types/onyx';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestEditReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.EDIT_REPORT>;

function IOURequestEditReport({route}: IOURequestEditReportProps) {
    const {backTo, reportID, action, shouldTurnOffSelectionMode, transactionID: transactionIDFromParams} = route.params;
    const {selectedTransactionIDs} = useSearchSelectionContext();
    const transactionIDs = transactionIDFromParams ? [transactionIDFromParams] : selectedTransactionIDs;
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`);
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
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
    const selectedReportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport?.policyID}`];

    const hasPerDiemTransactions = useHasPerDiemTransactions(transactionIDs);

    // When moving an expense that belongs to another user, or when the selection includes per diem
    // transactions, use the policy of their report (or the transaction's policy as fallback) so the
    // selected workspace is preserved.
    // For the current user's own non-per-diem expenses, fall back to undefined to let the default workspace apply.
    const isOwnedByOther = selectedReport?.ownerAccountID !== currentUserPersonalDetails.accountID;
    const isOwnedByOtherOrHasPerDiem = isOwnedByOther || hasPerDiemTransactions;
    const targetExpensePolicyID = isOwnedByOtherOrHasPerDiem ? selectedReport?.policyID : undefined;
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(hasPerDiemTransactions, undefined, targetExpensePolicyID);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.email ?? '');
    const policyForMovingExpenses = policyForMovingExpensesID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyForMovingExpensesID}`] : undefined;
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [maybeTransactions] = useTransactionsByID(transactionIDs);
    const transactions = maybeTransactions?.filter((transaction): transaction is Transaction => !!transaction) ?? [];
    const selectReport = (item: TransactionGroupListItem, report?: OnyxEntry<Report>) => {
        if (transactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissToSuperWideRHP();
            return;
        }

        const newReport = report ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${item.value}`];
        const policyTagList = item?.policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${item.policyID}`] : {};

        setNavigationActionToMicrotaskQueue(() => {
            changeTransactionsReport({
                transactionIDs,
                isASAPSubmitBetaEnabled,
                accountID: currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: currentUserPersonalDetails.email ?? '',
                newReport,
                policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
                reportNextStep,
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${item.policyID}`],
                policyTagList,
                transactions,
                transactionViolations,
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
            transactionViolations,
        });
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissToSuperWideRHP();
    };

    const createReportForPolicy = (shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!hasPerDiemTransactions && !policyForMovingExpenses?.id) {
            return;
        }

        const policyForNewReport = hasPerDiemTransactions ? selectedReportPolicy : policyForMovingExpenses;
        const optimisticReport = createNewReport(ownerPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policyForNewReport, betas, false, shouldDismissEmptyReportsConfirmation);
        selectReport(
            {
                value: optimisticReport.reportID,
                keyForList: optimisticReport.reportID,
            },
            optimisticReport,
        );
    };

    const {handleCreateReport} = useConditionalCreateEmptyReportConfirmation({
        policyID: policyForMovingExpensesID,
        policyName: policyForMovingExpenses?.name ?? '',
        onCreateReport: createReportForPolicy,
        shouldBypassConfirmation: true,
    });

    const createReport = () => {
        const restrictionPolicy = hasPerDiemTransactions ? selectedReportPolicy : policyForMovingExpenses;
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
        if (!hasPerDiemTransactions && !policyForMovingExpensesID && !shouldSelectPolicy) {
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
            backTo={backTo}
            selectedReportID={reportID}
            transactionIDs={transactionIDs}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing={action === CONST.IOU.ACTION.EDIT}
            createReport={createReport}
            isPerDiemRequest={hasPerDiemTransactions}
            transactionPolicyID={targetExpensePolicyID}
        />
    );
}

export default withWritableReportOrNotFound(IOURequestEditReport);
