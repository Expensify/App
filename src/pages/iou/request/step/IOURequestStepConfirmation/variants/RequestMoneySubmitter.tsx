import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useRequestMoneySubmission from '@pages/iou/request/step/confirmation/submission/useRequestMoneySubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';

import CONST from '@src/CONST';

import {useImperativeHandle} from 'react';

import type {ExpenseSubmitterProps} from './types';

/**
 * Submits an expense through RequestMoney: manual, scan and time expenses, plus the paths that fall
 * through the others (e.g. a distance or per diem expense moved off a track expense).
 */
function RequestMoneySubmitter({submissionParams, isSelfDMDestination, ref}: ExpenseSubmitterProps) {
    const {
        transaction,
        policy,
        participants,
        iouType,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isUnreported,
        isPolicyExpenseChat,
        submitLock,
    } = submissionParams;

    const transactionTaxValues = getTransactionTaxValues({
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

    const requestMoneySubmission = useRequestMoneySubmission({
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

    const createTransaction = guardSubmission(submitLock, requestMoneySubmission.createTransaction, blockDistanceRequestIfNeeded);

    useImperativeHandle(ref, () => createTransaction, [createTransaction]);

    return null;
}

export default RequestMoneySubmitter;
