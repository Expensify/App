import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useRequestMoneySubmission from '@pages/iou/request/step/confirmation/submission/useRequestMoneySubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/**
 * Confirms an expense submitted through RequestMoney: manual, scan and time expenses, plus the paths that fall
 * through the others (e.g. a distance or per diem expense moved off a track expense).
 */
function RequestMoneyConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
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
    const {isSelfDMDestination} = orchestratorProps;

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

    const createTransaction = guardSubmission(submitLock, requestMoneySubmission.createTransaction, blockDistanceRequestIfNeeded);

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

export default RequestMoneyConfirmation;
