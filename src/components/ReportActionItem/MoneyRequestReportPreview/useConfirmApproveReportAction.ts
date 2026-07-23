/**
 * Returns the confirm-approval handler shared by the report-preview Approve and Pay buttons,
 * handling delegate-access restrictions, held expenses, and the approveMoneyRequest call.
 */
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {hasHeldExpensesFromTransactions as hasHeldExpensesReportUtils} from '@libs/ReportUtils';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import type useReportPreviewActionButtonData from './useReportPreviewActionButtonData';

import {useReportPreviewActions, useReportPreviewActionState} from './MoneyRequestReportPreviewContext';

function useConfirmApproveReportAction(actionButtonData: ReturnType<typeof useReportPreviewActionButtonData>, transactions: Transaction[], hasViolations: boolean) {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {shouldShowPayButton} = useReportPreviewActionState();
    const {startApprovedAnimation, onHoldMenuOpen} = useReportPreviewActions();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {iouReport, policy, ownerLogin, userBillingGracePeriodEnds, iouReportNextStep, amountOwed, ownerBillingGracePeriodEnd, delegateEmail} = actionButtonData;

    return () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (hasHeldExpensesReportUtils(transactions)) {
            onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.APPROVE, undefined, shouldShowPayButton);
        } else {
            approveMoneyRequest({
                expenseReport: iouReport,
                expenseReportPolicy: policy,
                currentUserAccountIDParam: currentUserDetails.accountID,
                currentUserEmailParam: currentUserDetails.email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                ownerLogin,
                full: true,
                onApproved: startApprovedAnimation,
                delegateEmail,
                isTrackIntentUser,
            });
        }
    };
}

export default useConfirmApproveReportAction;
