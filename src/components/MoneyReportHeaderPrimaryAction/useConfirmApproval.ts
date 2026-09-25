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

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';
import type AdditionalPayOnyxData from '@userActions/IOU/types/AdditionalPayOnyxData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';
import {transactionViolationsByIDsSelector} from '@selectors/TransactionViolations';
// eslint-disable-next-line no-restricted-imports -- Violations must be live, not from the Search snapshot.
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

type UseConfirmApprovalOptions = {
    getAdditionalOnyxData?: () => AdditionalPayOnyxData;
    fallbackReport?: OnyxEntry<Report>;
    fallbackPolicy?: OnyxEntry<Policy>;
    fallbackTransactions?: Transaction[];
};

function useConfirmApproval(
    reportID: string | undefined,
    startApprovedAnimation: () => void,
    {getAdditionalOnyxData, fallbackReport, fallbackPolicy, fallbackTransactions}: UseConfirmApprovalOptions = {},
) {
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [liveReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const moneyRequestReport = liveReport ?? fallbackReport;
    const [livePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const policy = livePolicy ?? fallbackPolicy;
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateAccountID = useDelegateAccountID();
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID),
    });
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const liveTransactions = Object.values(reportTransactions);
    const transactions = liveTransactions.length > 0 || !fallbackTransactions ? liveTransactions : fallbackTransactions;
    const [transactionViolations] = useOnyxWithoutSnapshots(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: transactionViolationsByIDsSelector(transactions.map((transaction) => transaction.transactionID)),
    });
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, transactionViolations, accountID, email ?? '', undefined, transactions);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(transactions);

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
