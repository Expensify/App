import React, {useState} from 'react';
import DecisionModal from '@components/DecisionModal';
import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';
import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {ModalProps} from './ModalContext';

type HoldMenuModalWrapperProps = ModalProps & {
    reportID: string | undefined;
    chatReportID: string | undefined;
    requestType: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    nonHeldAmount?: string;
    fullAmount: string;
    hasNonHeldExpenses?: boolean;
    transactionCount: number;
    onConfirm?: (full: boolean) => void;
};

function HoldMenuModalWrapper({
    closeModal,
    reportID,
    chatReportID,
    requestType,
    paymentType,
    methodID,
    nonHeldAmount = '0',
    fullAmount,
    hasNonHeldExpenses,
    transactionCount,
    onConfirm,
}: HoldMenuModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);

    const {onSubmit, isApprove} = useHoldMenuSubmit({
        moneyRequestReport,
        chatReport,
        requestType,
        paymentType,
        methodID,
        onClose: () => setIsVisible(false),
        onConfirm,
    });

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={() => setIsVisible(false)}
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
            onModalHide={() => {
                if (isVisible) {
                    return;
                }
                closeModal({action: 'CLOSE'});
            }}
        />
    );
}

export default HoldMenuModalWrapper;
export type {ActionHandledType, HoldMenuModalWrapperProps};
