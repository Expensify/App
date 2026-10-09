import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import {resolveOptimisticChatReportID} from '@libs/IOUUtils';
import {submitWithDismissFirst} from '@libs/Navigation/helpers/submitWithDismissFirst';
import Navigation from '@libs/Navigation/Navigation';

import useSendMoneySubmission from '@pages/iou/request/step/confirmation/submission/useSendMoneySubmission';

import CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

type PayConfirmationProps = Omit<ConfirmationVariantProps, 'orchestratorProps'> & {
    /** Report revealed after sending money. */
    destinationReportID: string | undefined;

    /** Optimistic ID of a not-yet-created P2P chat the money is sent into. */
    optimisticP2PDestinationReportID: string | undefined;
};

/**
 * Confirms sending money, through SendMoney. Pay confirms through `onSendMoney` and never calls `onConfirm`, so it
 * doesn't mount SubmitExpenseOrchestrator.
 */
function PayConfirmation({submissionParams, listProps, destinationReportID, optimisticP2PDestinationReportID}: PayConfirmationProps) {
    const {transaction, receiptFiles, report, participants, currentUserPersonalDetails, onExpenseWriteWillStart, submitLock} = submissionParams;
    const {isConfirmed, setIsConfirmed} = submitLock;

    const {sendMoney} = useSendMoneySubmission({
        transaction,
        receiptFiles,
        report,
        participants,
        currentUserPersonalDetails,
        setIsConfirmed,
        onExpenseWriteWillStart,
    });

    const handleSendMoney = (paymentMethod: PaymentMethodType | undefined) => {
        if (isConfirmed) {
            return;
        }

        if (paymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && paymentMethod !== CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            sendMoney(paymentMethod);
            return;
        }

        const participant = participants.at(0);
        if (!participant) {
            sendMoney(paymentMethod);
            return;
        }

        const resolvedReportIDs = optimisticP2PDestinationReportID
            ? {optimisticChatReportID: optimisticP2PDestinationReportID, chatReportID: optimisticP2PDestinationReportID}
            : resolveOptimisticChatReportID([participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID], report);
        const payDestinationReportID = optimisticP2PDestinationReportID ?? destinationReportID ?? resolvedReportIDs.chatReportID;
        if (!payDestinationReportID || Navigation.getTopmostReportId() === payDestinationReportID) {
            sendMoney(paymentMethod, {resolvedReportIDs});
            return;
        }

        setIsConfirmed(true);
        submitWithDismissFirst({
            executeWrite: (overrides) =>
                sendMoney(paymentMethod, {
                    shouldHandleNavigation: overrides.shouldHandleNavigation,
                    resolvedReportIDs,
                    shouldStartTracking: false,
                }),
            destinationReportID: payDestinationReportID,
            telemetryContext: {
                scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.SEND_MONEY,
                iouType: CONST.IOU.TYPE.PAY,
                requestType: CONST.IOU.TYPE.PAY,
                isFromGlobalCreate: !report?.reportID,
                hasReceipt: !!transaction?.receipt,
            },
        });
    };

    return (
        <MoneyRequestConfirmationList
            {...listProps}
            onSendMoney={handleSendMoney}
            isConfirming={false}
        />
    );
}

export default PayConfirmation;
