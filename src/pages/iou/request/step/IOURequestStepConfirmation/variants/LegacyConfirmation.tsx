import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';
import useExpenseSubmission from '@pages/iou/request/step/confirmation/useExpenseSubmission';

import React, {useEffect} from 'react';

import type {ConfirmationVariantProps} from './types';

/**
 * TEMP: serves every submission path that hasn't forked into its own variant yet, through the shared
 * `useExpenseSubmission` composer. Shrinks as paths fork out and is deleted along with that composer.
 */
function LegacyConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    // TEMP: remount check for the per-path split - remove before merge.
    useEffect(() => {
        console.log('[ConfirmationVariant] LegacyConfirmation mounted', submissionParams.transaction?.transactionID, submissionParams.iouType);
        return () => console.log('[ConfirmationVariant] LegacyConfirmation unmounted');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
