import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isDistanceRequest as isDistanceRequestTransactionUtils, isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useRequestMoneySubmission from '@pages/iou/request/step/confirmation/submission/useRequestMoneySubmission';
import useTrackExpenseSubmission from '@pages/iou/request/step/confirmation/submission/useTrackExpenseSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import {SUBMISSION_PATH} from '@pages/iou/request/step/confirmation/submission/utils/resolveSubmissionPath';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

type RequestMoneyConfirmationProps = ConfirmationVariantProps & {
    /** Which path submits the expense. It becomes TRACK while "To" is the self DM, or for a tracked expense. */
    submissionPath: typeof SUBMISSION_PATH.REQUEST_MONEY | typeof SUBMISSION_PATH.TRACK;
};

/**
 * Confirms an expense submitted through RequestMoney or through TrackExpense while "To" is the self DM or the expense is tracked.
 * Both submissions stay mounted so switching "To" doesn't remount the orchestrator and the list.
 */
function RequestMoneyConfirmation({submissionPath, submissionParams, orchestratorProps, listProps}: RequestMoneyConfirmationProps) {
    const {transaction, policy, iouType, isManualDistanceRequest, isOdometerDistanceRequest, isPolicyExpenseChat, isSelfDMDestination, submitLock} = submissionParams;
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);

    const transactionTaxValues = getTransactionTaxValues({transaction, policy, iouType, isPolicyExpenseChat, isSelfDMDestination});

    const submissionHookParams = {
        ...submissionParams,
        ...transactionTaxValues,
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
    };

    const requestMoneySubmission = useRequestMoneySubmission(submissionHookParams);
    const trackSubmission = useTrackExpenseSubmission(submissionHookParams);

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    const createTransaction = guardSubmission(
        submitLock,
        submissionPath === SUBMISSION_PATH.TRACK ? trackSubmission.createTransaction : requestMoneySubmission.createTransaction,
        blockDistanceRequestIfNeeded,
    );

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
