import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useTrackExpenseSubmission from '@pages/iou/request/step/confirmation/submission/useTrackExpenseSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms a tracked expense (track, categorize, share, or a submit into a new draft workspace), submitting through TrackExpense. */
function TrackConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {transaction, policy, participants, iouType, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, isTimeRequest, isUnreported, isPolicyExpenseChat, submitLock} =
        submissionParams;
    const {isSelfDMDestination} = orchestratorProps;

    const transactionTaxValues = getTransactionTaxValues({
        transaction,
        policy,
        isPolicyExpenseChat,
        isUnreported,
        isTrackExpense: iouType === CONST.IOU.TYPE.TRACK,
        isSelfDMDestination,
        isDistanceRequest,
        isTimeRequest,
    });

    const trackSubmission = useTrackExpenseSubmission({
        ...submissionParams,
        selectedParticipants: participants.filter((participant) => participant.selected),
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
        isSelfDMDestination,
        ...transactionTaxValues,
    });

    // Only a workspace destination can enforce a workspace's distance rules.
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const createTransaction = guardSubmission(submitLock, trackSubmission.createTransaction, blockDistanceRequestIfNeeded);

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

export default TrackConfirmation;
