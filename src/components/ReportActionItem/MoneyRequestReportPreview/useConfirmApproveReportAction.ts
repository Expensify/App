/**
 * Returns the confirm-approval handler for the report-preview Approve button, handling delegate-access
 * restrictions and the approveMoneyRequest call. The partial/full choice for reports with held expenses is
 * surfaced up front by `ExpenseHeaderApprovalButton`, so it arrives here as the `full` flag.
 */
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import type useReportPreviewActionButtonData from './useReportPreviewActionButtonData';

import {useReportPreviewActions} from './MoneyRequestReportPreviewContext';

function useConfirmApproveReportAction(actionButtonData: ReturnType<typeof useReportPreviewActionButtonData>, hasViolations: boolean) {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {startApprovedAnimation} = useReportPreviewActions();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {iouReport, policy, ownerLogin, userBillingGracePeriodEnds, amountOwed, ownerBillingGracePeriodEnd, delegateEmail, delegateAccountID} = actionButtonData;

    return (full = true) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else {
            approveMoneyRequest({
                getCurrencyDecimals,
                expenseReport: iouReport,
                expenseReportPolicy: policy,
                currentUserAccountIDParam: currentUserDetails.accountID,
                currentUserEmailParam: currentUserDetails.email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
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
            });
        }
    };
}

export default useConfirmApproveReportAction;
