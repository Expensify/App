import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import * as IOU from '@userActions/IOU';
import type * as OnyxTypes from '@src/types/onyx';
import {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import DecisionModal from './DecisionModal';

type ProcessMoneyRequestHoldMenuProps = {
    /** The chat report this report is linked to */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** Full amount of expense report to pay */
    fullAmount: string;

    /** Is the window width narrow, like on a mobile device? */
    isSmallScreenWidth: boolean;

    /** Whether modal is visible */
    isVisible: boolean;

    /** The report currently being looked at */
    moneyRequestReport: OnyxTypes.Report;

    /** Not held amount of expense report */
    nonHeldAmount?: string;

    /** Callback for closing modal */
    onClose: () => void;

    /** Type of payment */
    paymentType: PaymentMethodType;

    /** Type of action handled either 'pay' or 'approve' */
    requestType?: string;
};

function ProcessMoneyRequestHoldMenu({
    requestType,
    nonHeldAmount,
    fullAmount,
    isSmallScreenWidth = false,
    onClose,
    isVisible,
    paymentType,
    chatReport,
    moneyRequestReport,
}: ProcessMoneyRequestHoldMenuProps) {
    const {translate} = useLocalize();
    const isApprove = requestType === 'approve';

    const onSubmit = (full: boolean) => {
        if (isApprove) {
            IOU.approveMoneyRequest(moneyRequestReport, full);
        } else if (chatReport) {
            IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport, full);
        }
        onClose();
    };

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount')}
            firstOptionText={nonHeldAmount ? `${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${nonHeldAmount}` : undefined}
            secondOptionText={`${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
        />
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
