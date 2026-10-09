import InvoiceConfirmationList from '@components/MoneyRequestConfirmationList/variants/InvoiceConfirmationList';

import useInvoiceSubmission from '@pages/iou/request/step/confirmation/submission/useInvoiceSubmission';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import React from 'react';

import type {ConfirmationVariantProps} from './types';

/** Confirms an invoice, submitting through SendInvoice. */
function InvoiceConfirmation({submissionParams, orchestratorProps, listProps}: ConfirmationVariantProps) {
    const {transaction, receiptFiles, report, reportID, policy, policyCategories, currentUserPersonalDetails, action, draftTransactionIDs, submitLock} = submissionParams;

    const invoiceSubmission = useInvoiceSubmission({
        transaction,
        receiptFiles,
        report,
        reportID,
        policy,
        policyCategories,
        currentUserPersonalDetails,
        action,
        draftTransactionIDs,
    });

    // An invoice is never a distance request, so there's no distance block to pass.
    const createTransaction = guardSubmission(submitLock, invoiceSubmission.createTransaction);

    return (
        <SubmitExpenseOrchestrator
            {...orchestratorProps}
            createTransaction={createTransaction}
        >
            {({onConfirm, isConfirming}) => (
                <InvoiceConfirmationList
                    {...listProps}
                    onConfirm={onConfirm}
                    isConfirming={isConfirming}
                />
            )}
        </SubmitExpenseOrchestrator>
    );
}

export default InvoiceConfirmation;
