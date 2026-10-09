import DistanceConfirmationList from '@components/MoneyRequestConfirmationList/variants/DistanceConfirmationList';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import useDistanceSubmission from '@pages/iou/request/step/confirmation/submission/useDistanceSubmission';
import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms a distance expense (map, manual, odometer or GPS), submitting through CreateDistanceRequest. */
function DistanceConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {
        transaction,
        transactions,
        receiptFiles,
        report,
        reportDrafts,
        policy,
        policyCategories,
        personalDetails,
        currentUserPersonalDetails,
        participants,
        iouType,
        action,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isUnreported,
        isPolicyExpenseChat,
        draftTransactionIDs,
        backToReport,
        onExpenseWriteWillStart,
        submitLock,
    } = submissionParams;
    const {isSelfDMDestination} = orchestratorProps;

    // TEMP: remount check for the per-path split - remove before merge.
    useEffect(() => {
        console.log('[ConfirmationVariant] DistanceConfirmation mounted', transaction?.transactionID);
        return () => console.log('[ConfirmationVariant] DistanceConfirmation unmounted');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {transactionTaxCode, transactionTaxAmount, transactionTaxValue} = getTransactionTaxValues({
        transaction,
        policy,
        isPolicyExpenseChat,
        isUnreported,
        isTrackExpense: iouType === CONST.IOU.TYPE.TRACK,
        isSelfDMDestination,
        isDistanceRequest: true,
        isPerDiemRequest,
        isTimeRequest,
    });

    const distanceSubmission = useDistanceSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        reportDrafts,
        policy,
        policyCategories,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants: participants.filter((participant) => participant.selected),
        iouType,
        isGPSDistanceRequest: isGPSDistanceRequestTransactionUtils(transaction),
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        backToReport,
        draftTransactionIDs,
        isSelfDMDestination,
        action,
        onExpenseWriteWillStart,
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
