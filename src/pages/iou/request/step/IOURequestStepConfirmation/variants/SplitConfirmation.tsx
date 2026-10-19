import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import useSplitSubmission from '@pages/iou/request/step/confirmation/submission/useSplitSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms a split, submitting through splitBill / startSplitBill / splitBillAndOpenReport. */
function SplitConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {transaction, policy, participants, isDistanceRequest, isUnreported, isPolicyExpenseChat, submitLock} = submissionParams;

    const transactionTaxValues = getTransactionTaxValues({transaction, policy, isPolicyExpenseChat, isUnreported, isDistanceRequest});

    const splitSubmission = useSplitSubmission({
        ...submissionParams,
        policyID: policy?.id,
        selectedParticipants: participants.filter((participant) => participant.selected),
        releaseSubmitLock: submitLock.unlockSubmission,
        ...transactionTaxValues,
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
