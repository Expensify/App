import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';

import type {AdditionalPayOnyxData} from '@userActions/IOU/PayMoneyRequest';
import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';

/**
 * Shared approve handler for the report header, report preview and Search rows.
 *
 * `getAdditionalOnyxData` is resolved at approve time (not on every render) so Search rows can attach the
 * optimistic data that removes the row from the current results.
 */
function useConfirmApproval(reportID: string | undefined, startApprovedAnimation: () => void, getAdditionalOnyxData?: () => AdditionalPayOnyxData) {
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateAccountID = useDelegateAccountID();
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID),
    });
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(Object.values(reportTransactions));

    const onApprove = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        if (!isSubmitPolicy(policy)) {
            startApprovedAnimation();
        }
        approveMoneyRequest({
            getCurrencyDecimals,
            expenseReport: moneyRequestReport,
            expenseReportPolicy: policy,
            rules,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            ownerLogin,
            full,
            onApproved: startApprovedAnimation,
            delegateEmail,
            delegateAccountID,
            isTrackIntentUser,
            additionalOnyxData: getAdditionalOnyxData?.(),
        });
    };

    // When there are held expenses the partial/full choice is surfaced up front via the settlement button's approve
    // submenu, so this always approves the full report (used for the non-held case and as a safe fallback).
    const confirmApproval = () => onApprove(true);

    return {confirmApproval, onApprove, isAnyTransactionOnHold};
}

export default useConfirmApproval;
