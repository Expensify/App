import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useTrackExpenseSubmission from '@pages/iou/request/step/confirmation/submission/useTrackExpenseSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';

import CONST from '@src/CONST';

import {useImperativeHandle} from 'react';

import type {ExpenseSubmitterProps} from './types';

/** Submits a tracked expense through TrackExpense. */
function TrackSubmitter({submissionParams, isSelfDMDestination, ref}: ExpenseSubmitterProps) {
    const {transaction, policy, participants, iouType, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, isTimeRequest, isUnreported, isPolicyExpenseChat, submitLock} =
        submissionParams;

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
        ...transactionTaxValues,
        selectedParticipants: participants.filter((participant) => participant.selected),
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
        isSelfDMDestination,
    });

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const createTransaction = guardSubmission(submitLock, trackSubmission.createTransaction, blockDistanceRequestIfNeeded);

    useImperativeHandle(ref, () => createTransaction, [createTransaction]);

    return null;
}

export default TrackSubmitter;
