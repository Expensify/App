import DistanceConfirmationList from '@components/MoneyRequestConfirmationList/variants/DistanceConfirmationList';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useDistanceSubmission from '@pages/iou/request/step/confirmation/submission/useDistanceSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms a distance expense (map, manual, odometer or GPS), submitting through CreateDistanceRequest. */
function DistanceConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {transaction, policy, participants, isManualDistanceRequest, isOdometerDistanceRequest, isPolicyExpenseChat, submitLock} = submissionParams;
    const {isSelfDMDestination} = orchestratorProps;

    const transactionTaxValues = getTransactionTaxValues({transaction, policy, isPolicyExpenseChat, isDistanceRequest: true});

    const distanceSubmission = useDistanceSubmission({
        ...submissionParams,
        selectedParticipants: participants.filter((participant) => participant.selected),
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
        isSelfDMDestination,
        ...transactionTaxValues,
    });

    // Only a workspace destination can enforce a workspace's distance rules.
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest: true,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const createTransaction = guardSubmission(submitLock, distanceSubmission.createTransaction, blockDistanceRequestIfNeeded);

    return (
        <SubmitExpenseOrchestrator
            {...orchestratorProps}
            createTransaction={createTransaction}
        >
            {({onConfirm, isConfirming}) => (
                <DistanceConfirmationList
                    {...listProps}
                    onConfirm={onConfirm}
                    isConfirming={isConfirming}
                />
            )}
        </SubmitExpenseOrchestrator>
    );
}

export default DistanceConfirmation;
