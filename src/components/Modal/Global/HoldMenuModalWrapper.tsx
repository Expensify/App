import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DecisionModal from '@components/DecisionModal';
import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';
import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
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
    // Optional overrides for callers that source reports from a place other
    // than the main report collection (e.g. Search rows render from a snapshot).
    moneyRequestReport?: OnyxEntry<Report>;
    chatReport?: OnyxEntry<Report>;
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
    moneyRequestReport: moneyRequestReportOverride,
    chatReport: chatReportOverride,
}: HoldMenuModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [moneyRequestReportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const moneyRequestReport = moneyRequestReportOverride ?? moneyRequestReportFromOnyx;
    const chatReport = chatReportOverride ?? chatReportFromOnyx;

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
