import React, {useImperativeHandle, useState} from 'react';
import type {Ref} from 'react';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {ReportPreviewHoldMenuHandle} from './MoneyRequestReportPreviewContext';
import {useReportPreviewActions, useReportPreviewData} from './MoneyRequestReportPreviewContext';

type ReportPreviewHoldMenuProps = {
    /** Imperative handle the sibling action button uses to open the menu */
    ref?: Ref<ReportPreviewHoldMenuHandle>;
};

/**
 * Self-contained hold/approve confirmation menu for the money request report preview. It owns all of its own
 * visibility state and is opened imperatively (via ref) by the sibling action button, so the preview shell does not
 * have to carry the menu's state. Reads the report subject + animation actions from the preview context.
 */
function ReportPreviewHoldMenu({ref}: ReportPreviewHoldMenuProps) {
    const {iouReport, chatReport, transactions} = useReportPreviewData();
    const {startAnimation, startApprovedAnimation} = useReportPreviewActions();
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [methodID, setMethodID] = useState<number>();
    const [shouldShowPayButton, setShouldShowPayButton] = useState(false);

    useImperativeHandle(
        ref,
        () => ({
            open: (holdRequestType, holdPaymentType, canPay, holdMethodID) => {
                // The shared onHoldMenuOpen contract widens the request type to `string`; the action buttons only ever
                // pass PAY/APPROVE, so guard before narrowing to ActionHandledType.
                if (holdRequestType !== CONST.IOU.REPORT_ACTION_TYPE.PAY && holdRequestType !== CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                    return;
                }
                setRequestType(holdRequestType);
                setPaymentType(holdPaymentType);
                setMethodID(holdMethodID);
                setShouldShowPayButton(!!canPay);
                setIsHoldMenuVisible(true);
            },
        }),
        [],
    );

    if (!isHoldMenuVisible || !iouReport || !requestType) {
        return null;
    }

    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(transactions);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, shouldShowPayButton, transactions);

    return (
        <ProcessMoneyReportHoldMenu
            nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
            requestType={requestType}
            fullAmount={fullAmount}
            onClose={() => setIsHoldMenuVisible(false)}
            isVisible={isHoldMenuVisible}
            paymentType={paymentType}
            methodID={methodID}
            chatReport={chatReport}
            moneyRequestReport={iouReport}
            transactionCount={transactions.length}
            hasNonHeldExpenses={!hasOnlyHeldExpenses}
            onConfirm={() => {
                if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                    startApprovedAnimation();
                } else {
                    startAnimation();
                }
            }}
        />
    );
}

export default ReportPreviewHoldMenu;
