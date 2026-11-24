import AmountCell from '@components/Search/SearchList/ListItem/TotalCell';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow/types';

import {getTransactionPolicyConvertedDisplayAmount, isSettled} from '@libs/ReportUtils';
import {getCurrency, isFailedScanAmountPlaceholder, isScanning} from '@libs/TransactionUtils';

import type {Policy, Report} from '@src/types/onyx';

import React from 'react';

type ConvertedAmountCellProps = {
    /** The expense whose amount is shown in its workspace's output currency */
    transactionItem: TransactionWithOptionalSearchFields;

    /** Report passed explicitly (used in IOU report view where transactionItem.report may be undefined) */
    report?: Report;

    /** Policy passed explicitly (used in IOU report view where transactionItem.policy may be undefined) */
    policy?: Policy;
};

function ConvertedAmountCell({transactionItem, report, policy}: ConvertedAmountCellProps) {
    const effectiveReport = report ?? transactionItem.report;
    const effectivePolicy = policy ?? transactionItem.policy;

    // A failed scan leaves a placeholder amount that the Amount column hides, so this column hides it too.
    if (isFailedScanAmountPlaceholder(transactionItem, isSettled(effectiveReport))) {
        return null;
    }

    // Expenses created offline have no workspace amount from the server yet, so they show their own currency until the next search.
    const currency = (transactionItem.policyConvertedAmount != null ? transactionItem.policyCurrency : undefined) ?? getCurrency(transactionItem);

    return (
        <AmountCell
            total={getTransactionPolicyConvertedDisplayAmount(transactionItem, effectiveReport, effectivePolicy)}
            currency={currency}
            isScanning={isScanning(transactionItem)}
        />
    );
}

export default ConvertedAmountCell;
