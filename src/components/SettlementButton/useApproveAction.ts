import type {OnyxCollection} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import type useSettlementData from '@hooks/useSettlementData';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, Report} from '@src/types/onyx';

type ApproveActionParams = {
    data: ReturnType<typeof useSettlementData>;
    iouReport: Report | undefined;
    formattedAmount: string;
    shouldDisableApproveButton: boolean;
    confirmApproval?: () => void;
    userBillingGraceEndPeriods: OnyxCollection<BillingGraceEndPeriod>;
};

/**
 * Handles the approve action: builds the approve button option and provides
 * the handler that calls approveMoneyRequest with all required parameters.
 */
function useApproveAction({data, iouReport, formattedAmount, shouldDisableApproveButton, confirmApproval, userBillingGraceEndPeriods}: ApproveActionParams) {
    const {icons, translate, policy, accountID} = data;
    const {email} = useCurrentUserPersonalDetails();

    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations, accountID, email ?? '');

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
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: iouReportNextStep,
                betas,
                userBillingGraceEndPeriods,
                amountOwed,
                full: false,
            });
        }
    };

    return {approveButtonOption, handleApprove};
}

export default useApproveAction;
