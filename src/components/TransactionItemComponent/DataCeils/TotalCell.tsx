import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import {getCurrency as getTransactionCurrency, hasReceipt, isReceiptBeingScanned} from '@libs/TransactionUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import TextWithTooltip from '@components/TextWithTooltip';
import colors from '@styles/theme/colors';
import type DataCellProps from './DateCellProps';


function TotalCell({showTooltip, transactionItem}: DataCellProps) {
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
            style={[styles.optionDisplayName, styles.justifyContentCenter, {color:colors.green800}]}
        />
    );
}

TotalCell.displayName = 'TotalCell';
export default TotalCell;
