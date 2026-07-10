import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {delegateEmailSelector} from '@selectors/Account';
import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';
import React from 'react';

import {useReportPreviewActions, useReportPreviewActionState, useReportPreviewData} from './MoneyRequestReportPreviewContext';

function ApproveActionButton() {
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {iouReportID} = useReportPreviewData();
    const {shouldShowPayButton} = useReportPreviewActionState();
    const {startApprovedAnimation, onHoldMenuOpen} = useReportPreviewActions();

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(iouReport?.ownerAccountID)});

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(iouReport?.reportID);
    const allTransactionValues = Object.values(reportTransactions);
    const transactions = allTransactionValues;

    const [transactionViolations] = useReportTransactionViolations(transactions);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, currentUserAccountID, currentUserEmail, undefined, transactions);

    const confirmApproval = () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (hasHeldExpensesReportUtils(transactions)) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.APPROVE, undefined, shouldShowPayButton);
        } else {
            approveMoneyRequest({
                expenseReport: iouReport,
                expenseReportPolicy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail,
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                ownerLogin,
                full: true,
                onApproved: startApprovedAnimation,
                delegateEmail,
            });
        }
    };

    return (
        <Button
            text={translate('iou.approve')}
            success
            onPress={confirmApproval}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.APPROVE_BUTTON}
        />
    );
}

export default ApproveActionButton;
