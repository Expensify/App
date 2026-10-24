import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

import Log from '@libs/Log';

import {SUBMISSION_PATH} from '@pages/iou/request/step/confirmation/submission/utils/resolveSubmissionPath';
import type {SubmitExpenseOrchestratorProps} from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import React, {useRef} from 'react';

import type {ConfirmationVariantProps} from './types';

import DistanceSubmitter from './DistanceSubmitter';
import RequestMoneySubmitter from './RequestMoneySubmitter';
import TrackSubmitter from './TrackSubmitter';

type ExpenseConfirmationProps = ConfirmationVariantProps & {
    /** Which of the three paths submits the expense. It can change while the page is open when "To" changes. */
    submissionPath: typeof SUBMISSION_PATH.REQUEST_MONEY | typeof SUBMISSION_PATH.TRACK | typeof SUBMISSION_PATH.DISTANCE;
};

/**
 * Confirms an expense submitted through RequestMoney, TrackExpense or CreateDistanceRequest. Changing "To" can switch
 * between these paths, so only the submitter is swapped and the orchestrator and list keep their state.
 */
function ExpenseConfirmation({submissionPath, submissionParams, orchestratorProps, listProps}: ExpenseConfirmationProps) {
    const latestCreateTransaction = useRef<SubmitExpenseOrchestratorProps['createTransaction'] | null>(null);

    // The orchestrator can call createTransaction after the RHP is dismissed and this page has unmounted,
    // so keep the last submitter's function instead of letting React clear it to null.
    const submitterRef = (submitterCreateTransaction: SubmitExpenseOrchestratorProps['createTransaction'] | null) => {
        if (!submitterCreateTransaction) {
            return;
        }
        latestCreateTransaction.current = submitterCreateTransaction;
    };

    const createTransaction: SubmitExpenseOrchestratorProps['createTransaction'] = (params) => {
        if (!latestCreateTransaction.current) {
            Log.warn('[ExpenseConfirmation] createTransaction called before any submitter was mounted - skipping submit');
            return false;
        }
        return latestCreateTransaction.current(params);
    };

    const submitterProps = {submissionParams, isSelfDMDestination: orchestratorProps.isSelfDMDestination, ref: submitterRef};

    const renderSubmitter = () => {
        switch (submissionPath) {
            case SUBMISSION_PATH.DISTANCE:
                return <DistanceSubmitter {...submitterProps} />;
            case SUBMISSION_PATH.TRACK:
                return <TrackSubmitter {...submitterProps} />;
            default:
                return <RequestMoneySubmitter {...submitterProps} />;
        }
    };

    return (
        <>
            {renderSubmitter()}
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
        </>
    );
}

export default ExpenseConfirmation;
