import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';

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
    const submitterRef = useRef<SubmitExpenseOrchestratorProps['createTransaction']>(null);

    const createTransaction: SubmitExpenseOrchestratorProps['createTransaction'] = (params) => submitterRef.current?.(params) ?? false;

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
