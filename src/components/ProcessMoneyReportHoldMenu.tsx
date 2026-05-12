import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';
import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import DecisionModal from './DecisionModal';

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

    /** Selected VBBA ID for payment */
    methodID?: number;

    /** Type of action handled */
    requestType?: ActionHandledType;

    /** Number of transaction of a money request */
    transactionCount: number;

    /** Callback invoked after the user confirms pay/approve, receives whether the full amount was chosen */
    onConfirm?: (full: boolean) => void;

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
    methodID,
    chatReport,
    moneyRequestReport,
    transactionCount,
    onConfirm,
    hasNonHeldExpenses,
}: ProcessMoneyReportHoldMenuProps) {
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {onSubmit, isApprove} = useHoldMenuSubmit({
        moneyRequestReport,
        chatReport,
        requestType,
        paymentType,
        methodID,
        onClose,
        onConfirm,
    });

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={
                hasNonHeldExpenses
                    ? translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount')
                    : translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', {count: transactionCount})
            }
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
