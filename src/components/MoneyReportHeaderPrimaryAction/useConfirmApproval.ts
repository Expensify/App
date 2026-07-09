import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useYourSpendPatchData from '@hooks/useYourSpendPatchData';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {delegateEmailSelector} from '@selectors/Account';
import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';

function useConfirmApproval(reportID: string | undefined, startApprovedAnimation: () => void) {
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {openHoldMenu} = useMoneyReportHeaderModals();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const yourSpendPatchData = useYourSpendPatchData();

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(Object.values(reportTransactions));

    const confirmApproval = () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            openHoldMenu({
                requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
                onConfirm: () => startApprovedAnimation(),
            });
        } else {
            if (!isSubmitPolicy(policy)) {
                startApprovedAnimation();
            }
            approveMoneyRequest({
                expenseReport: moneyRequestReport,
                expenseReportPolicy: policy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                ownerLogin,
                full: true,
                yourSpendPatchData,
                onApproved: startApprovedAnimation,
                delegateEmail,
            });
        }
    };

    return confirmApproval;
}

export default useConfirmApproval;
