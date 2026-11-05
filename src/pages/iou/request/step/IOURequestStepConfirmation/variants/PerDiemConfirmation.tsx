import PerDiemConfirmationList from '@components/MoneyRequestConfirmationList/variants/PerDiemConfirmationList';

import usePerDiemSubmission from '@pages/iou/request/step/confirmation/submission/usePerDiemSubmission';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms a per diem expense, submitting through CreatePerDiemExpense (or the self-DM variant when tracking). */
function PerDiemConfirmation({submissionParams, orchestratorProps, listProps, suppressDiscardPrompt}: ConfirmationVariantProps) {
    const {iouType, submitLock} = submissionParams;

    const perDiemSubmission = usePerDiemSubmission({
        ...submissionParams,
        isTrackExpense: iouType === CONST.IOU.TYPE.TRACK,
    });

    const createTransaction = guardSubmission(submitLock, perDiemSubmission.createTransaction);

    return (
        <SubmitExpenseOrchestrator
            {...orchestratorProps}
            createTransaction={createTransaction}
        >
            {({onConfirm, isConfirming}) => (
                <PerDiemConfirmationList
                    {...listProps}
                    onConfirm={() => {
                        suppressDiscardPrompt?.();
                        onConfirm();
                    }}
                    isConfirming={isConfirming}
                />
            )}
        </SubmitExpenseOrchestrator>
    );
}

export default PerDiemConfirmation;
