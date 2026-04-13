import {delegateEmailSelector} from '@selectors/Account';
import type {OnyxCollection} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, Report, TransactionViolation} from '@src/types/onyx';

type ApproveActionParams = {
    iouReport: Report | undefined;
    policyID: string;
    formattedAmount: string;
    shouldDisableApproveButton: boolean;
    confirmApproval?: () => void;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
};

/**
 * Handles the approve action: builds the approve button option and provides
 * the handler that calls approveMoneyRequest with all required parameters.
 */
function useApproveAction({iouReport, policyID, formattedAmount, shouldDisableApproveButton, confirmApproval, userBillingGracePeriodEnds}: ApproveActionParams) {
    const icons = useMemoizedLazyExpensifyIcons(['ThumbsUp'] as const);
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {accountID, email} = useCurrentUserPersonalDetails();

    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const transactionViolationsSelector = (violations: OnyxCollection<TransactionViolation[]>) => hasViolationsReportUtils(iouReport?.reportID, violations, accountID, email ?? '');
    const [hasViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: transactionViolationsSelector});

    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const approveButtonOption: DropdownOption<string> = {
        text: translate('iou.approve', {formattedAmount}),
        icon: icons.ThumbsUp,
        value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
        disabled: !!shouldDisableApproveButton,
    };

    const handleApprove = () => {
        if (confirmApproval) {
            confirmApproval();
        } else {
            approveMoneyRequest({
                expenseReport: iouReport,
                policy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations: !!hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                full: false,
                delegateEmail,
            });
        }
    };

    return {approveButtonOption, handleApprove};
}

export default useApproveAction;
