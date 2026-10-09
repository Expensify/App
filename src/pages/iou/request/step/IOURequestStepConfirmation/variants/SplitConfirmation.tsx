import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import useSplitSubmission from '@pages/iou/request/step/confirmation/submission/useSplitSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms a split, submitting through splitBill / startSplitBill / splitBillAndOpenReport. */
function SplitConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {
        transaction,
        transactions,
        receiptFiles,
        report,
        policy,
        personalDetails,
        currentUserPersonalDetails,
        participants,
        iouType,
        isDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isUnreported,
        isPolicyExpenseChat,
        submitLock,
    } = submissionParams;
    const {isSelfDMDestination} = orchestratorProps;

    // TEMP: remount check for the per-path split - remove before merge.
    useEffect(() => {
        console.log('[ConfirmationVariant] SplitConfirmation mounted', transaction?.transactionID);
        return () => console.log('[ConfirmationVariant] SplitConfirmation unmounted');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {transactionTaxCode, transactionTaxAmount, transactionTaxValue} = getTransactionTaxValues({
        transaction,
        policy,
        isPolicyExpenseChat,
        isUnreported,
        isTrackExpense: iouType === CONST.IOU.TYPE.TRACK,
        isSelfDMDestination,
        isDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
    });

    const splitSubmission = useSplitSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        policyID: policy?.id,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants: participants.filter((participant) => participant.selected),
        iouType,
        releaseSubmitLock: submitLock.releaseSubmitLock,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
    });

    // A distance split resolves to the distance path (see resolveSubmissionPath), so no distance block is passed here.
    const createTransaction = guardSubmission(submitLock, splitSubmission.createTransaction);

    return (
        <SubmitExpenseOrchestrator
            {...orchestratorProps}
            createTransaction={createTransaction}
        >
            {({onConfirm, isConfirming}) => (
                <MoneyRequestConfirmationList
                    {...listProps}
                    onConfirm={onConfirm}
                    isConfirming={isConfirming}
                />
            )}
        </SubmitExpenseOrchestrator>
    );
}

export default SplitConfirmation;
