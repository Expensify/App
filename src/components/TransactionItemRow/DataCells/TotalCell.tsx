import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getCurrency as getTransactionCurrency, hasReceipt, isReceiptBeingScanned} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TotalCell({shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = getTransactionCurrency(transactionItem);

    let amount = convertToDisplayString(Math.abs(transactionItem.amount), currency);

    if (hasReceipt(transactionItem) && isReceiptBeingScanned(transactionItem)) {
        amount = translate('iou.receiptStatusTitle');
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={amount}
            style={[styles.optionDisplayName, styles.justifyContentCenter]}
        />
    );
}

TotalCell.displayName = 'TotalCell';
export default TotalCell;
