import React, {useContext, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DecisionModal from './DecisionModal';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';

type ActionHandledType = DeepValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE.PAY | typeof CONST.IOU.REPORT_ACTION_TYPE.APPROVE>;

type ProcessMoneyReportHoldMenuProps = {
    /** The chat report this report is linked to */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** Full amount of expense report to pay */
    fullAmount: string;

    /** Whether modal is visible */
    isVisible: boolean;

    /** The report currently being looked at */
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;

    /** Not held amount of expense report */
    nonHeldAmount?: string;

    /** Callback for closing modal */
    onClose: () => void;

    /** Type of payment */
    paymentType?: PaymentMethodType;

    /** Type of action handled */
    requestType?: ActionHandledType;

    /** Number of transaction of a money request */
    transactionCount: number;

    /** Callback for displaying payment animation on IOU preview component */
    startAnimation?: () => void;

    /** Whether the report has non held expenses */
    hasNonHeldExpenses?: boolean;
};

function ProcessMoneyReportHoldMenu({
    requestType,
    nonHeldAmount = '0',
    fullAmount,
    onClose,
    isVisible,
    paymentType,
    chatReport,
    moneyRequestReport,
    transactionCount,
    startAnimation,
    hasNonHeldExpenses,
}: ProcessMoneyReportHoldMenuProps) {
    const {translate} = useLocalize();
    const isApprove = requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const policy = usePolicy(moneyRequestReport?.policyID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [moneyRequestReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const onSubmit = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (isApprove) {
            if (startAnimation) {
                startAnimation();
            }
            approveMoneyRequest(
                moneyRequestReport,
                activePolicy,
                currentUserDetails.accountID,
                currentUserDetails.email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                moneyRequestReportNextStep,
                betas,
                full,
            );
        } else if (chatReport && paymentType) {
            if (startAnimation) {
                startAnimation();
            }
            payMoneyRequest({
                paymentType,
                chatReport,
                iouReport: moneyRequestReport,
                introSelected,
                iouReportCurrentNextStepDeprecated: moneyRequestReportNextStep,
                currentUserAccountID: currentUserDetails.accountID,
                full,
                activePolicy,
                policy,
                betas,
            });
        }
        onClose();
    };

    const promptText = useMemo(() => {
        if (hasNonHeldExpenses) {
            return translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount');
        }
        return translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', {count: transactionCount});
    }, [hasNonHeldExpenses, transactionCount, translate, isApprove]);

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={promptText}
            firstOptionText={hasNonHeldExpenses ? `${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${nonHeldAmount}` : undefined}
            secondOptionText={`${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
        />
    );
}

export default ProcessMoneyReportHoldMenu;
export type {ActionHandledType};
