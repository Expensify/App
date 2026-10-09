import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import {resolveOptimisticChatReportID} from '@libs/IOUUtils';
import {submitWithDismissFirst} from '@libs/Navigation/helpers/submitWithDismissFirst';
import Navigation from '@libs/Navigation/Navigation';

import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';
import useExpenseSubmission from '@pages/iou/request/step/confirmation/useExpenseSubmission';

import CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

type LegacyConfirmationProps = ConfirmationVariantProps & {
    /** Report the pay flow reveals after sending money. */
    destinationReportID: string | undefined;

    /** Optimistic ID of a not-yet-created P2P chat the pay flow sends money into. */
    optimisticP2PDestinationReportID: string | undefined;
};

/**
 * TEMP: serves every submission path that hasn't forked into its own variant yet, through the shared
 * `useExpenseSubmission` composer. Shrinks as paths fork out and is deleted along with that composer.
 */
function LegacyConfirmation({submissionParams, orchestratorProps, listProps, destinationReportID, optimisticP2PDestinationReportID}: LegacyConfirmationProps) {
    const {participants, currentUserPersonalDetails, report, transaction, submitLock} = submissionParams;
    const {isConfirmed, setIsConfirmed} = submitLock;

    const {createTransaction, sendMoney} = useExpenseSubmission(submissionParams);

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
        <SubmitExpenseOrchestrator
            {...orchestratorProps}
            createTransaction={createTransaction}
        >
            {({onConfirm, isConfirming}) => (
                <MoneyRequestConfirmationList
                    {...listProps}
                    onConfirm={onConfirm}
                    onSendMoney={handleSendMoney}
                    isConfirming={isConfirming}
                />
            )}
        </SubmitExpenseOrchestrator>
    );
}

export default LegacyConfirmation;
