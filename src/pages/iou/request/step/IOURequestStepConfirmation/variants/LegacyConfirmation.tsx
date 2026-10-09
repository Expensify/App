import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';
import useExpenseSubmission from '@pages/iou/request/step/confirmation/useExpenseSubmission';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/**
 * TEMP: serves every submission path that hasn't forked into its own variant yet, through the shared
 * `useExpenseSubmission` composer. Shrinks as paths fork out and is deleted along with that composer.
 */
function LegacyConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {createTransaction} = useExpenseSubmission(submissionParams);

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

export default LegacyConfirmation;
