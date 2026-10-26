import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useDistanceSubmission from '@pages/iou/request/step/confirmation/submission/useDistanceSubmission';
import useTrackExpenseSubmission from '@pages/iou/request/step/confirmation/submission/useTrackExpenseSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/**
 * Confirms a distance expense, submitting through CreateDistanceRequest, or through TrackExpense while "To" is the
 * self DM. Both submissions stay mounted so switching "To" doesn't remount the orchestrator and the list.
 */
function DistanceConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {transaction, policy, participants, iouType, isManualDistanceRequest, isOdometerDistanceRequest, isUnreported, isPolicyExpenseChat, submitLock} = submissionParams;
    const {isSelfDMDestination} = orchestratorProps;

    const transactionTaxValues = getTransactionTaxValues({
        transaction,
        policy,
        isPolicyExpenseChat,
        isUnreported,
        isTrackExpense: iouType === CONST.IOU.TYPE.TRACK,
        isSelfDMDestination,
        isDistanceRequest: true,
    });

    const submissionHookParams = {
        ...submissionParams,
        ...transactionTaxValues,
        selectedParticipants: participants.filter((participant) => participant.selected),
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
        isSelfDMDestination,
    };

    const distanceSubmission = useDistanceSubmission(submissionHookParams);
    const trackSubmission = useTrackExpenseSubmission(submissionHookParams);

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest: true,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const createTransaction = guardSubmission(submitLock, isSelfDMDestination ? trackSubmission.createTransaction : distanceSubmission.createTransaction, blockDistanceRequestIfNeeded);

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

export default DistanceConfirmation;
