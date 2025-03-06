import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getCurrency as getTransactionCurrency, hasReceipt, isReceiptBeingScanned} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TotalCell({showTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = getTransactionCurrency(transactionItem);

    let amount = convertToDisplayString(Math.abs(transactionItem.amount), currency);

    if (hasReceipt(transactionItem) && isReceiptBeingScanned(transactionItem)) {
        amount = translate('iou.receiptStatusTitle');
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={amount}
            style={[styles.optionDisplayName, styles.justifyContentCenter, {color: colors.green800}]}
        />
    );
}

TotalCell.displayName = 'TotalCell';
export default TotalCell;
