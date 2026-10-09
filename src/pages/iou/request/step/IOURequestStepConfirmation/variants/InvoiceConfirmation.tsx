import InvoiceConfirmationList from '@components/MoneyRequestConfirmationList/variants/InvoiceConfirmationList';

import {getSpan} from '@libs/telemetry/activeSpans';

import type {CreateTransactionParams} from '@pages/iou/request/step/confirmation/submission/types';
import useInvoiceSubmission from '@pages/iou/request/step/confirmation/submission/useInvoiceSubmission';
import SubmitExpenseOrchestrator from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import CONST from '@src/CONST';

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

    // An invoice is never a distance request, so unlike the other paths there's no distance block to check first.
    const createTransaction = (params: CreateTransactionParams) => {
        getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE);
        if (!submitLock.acquireSubmitLock()) {
            return false;
        }
        return invoiceSubmission.createTransaction(params);
    };

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
