import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useDistanceSubmission from '@pages/iou/request/step/confirmation/submission/useDistanceSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';

import {useImperativeHandle} from 'react';

import type {ExpenseSubmitterProps} from './types';

/** Submits a distance expense (map, manual, odometer or GPS) through CreateDistanceRequest. */
function DistanceSubmitter({submissionParams, isSelfDMDestination, ref}: ExpenseSubmitterProps) {
    const {transaction, policy, participants, isManualDistanceRequest, isOdometerDistanceRequest, isPolicyExpenseChat, submitLock} = submissionParams;

    const transactionTaxValues = getTransactionTaxValues({transaction, policy, isPolicyExpenseChat, isDistanceRequest: true});

    const distanceSubmission = useDistanceSubmission({
        ...submissionParams,
        ...transactionTaxValues,
        selectedParticipants: participants.filter((participant) => participant.selected),
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
        isSelfDMDestination,
    });

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest: true,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const createTransaction = guardSubmission(submitLock, distanceSubmission.createTransaction, blockDistanceRequestIfNeeded);

    useImperativeHandle(ref, () => createTransaction, [createTransaction]);

    return null;
}

export default DistanceSubmitter;
