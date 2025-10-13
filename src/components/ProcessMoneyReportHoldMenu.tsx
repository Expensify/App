import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {approveMoneyRequest, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DecisionModal from './DecisionModal';

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
};

function ProcessMoneyReportHoldMenu({
    requestType,
    nonHeldAmount,
    fullAmount,
    onClose,
    isVisible,
    paymentType,
    chatReport,
    moneyRequestReport,
    transactionCount,
    startAnimation,
}: ProcessMoneyReportHoldMenuProps) {
    const {translate} = useLocalize();
    const isApprove = requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [moneyRequestChatReportRNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.chatReportID}`, {canBeMissing: true});
    const [chatReportRNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatReport?.chatReportID}`, {canBeMissing: true});

    const onSubmit = (full: boolean) => {
        if (isApprove) {
            if (startAnimation) {
                startAnimation();
            }
            approveMoneyRequest(moneyRequestReport, moneyRequestChatReportRNVP, full);
        } else if (chatReport && paymentType) {
            if (startAnimation) {
                startAnimation();
            }
            payMoneyRequest(paymentType, chatReport, chatReportRNVP, moneyRequestReport, introSelected, undefined, full, activePolicy);
        }
        onClose();
    };

    const promptText = useMemo(() => {
        if (nonHeldAmount) {
            return translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount');
        }
        return translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', {count: transactionCount});
    }, [nonHeldAmount, transactionCount, translate, isApprove]);

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={promptText}
            firstOptionText={nonHeldAmount ? `${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${nonHeldAmount}` : undefined}
            secondOptionText={`${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
        />
    );
}

ProcessMoneyReportHoldMenu.displayName = 'ProcessMoneyReportHoldMenu';

export default ProcessMoneyReportHoldMenu;
export type {ActionHandledType};
