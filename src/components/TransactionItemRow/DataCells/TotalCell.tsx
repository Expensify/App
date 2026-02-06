import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isScanning} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TotalCell({shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = getTransactionCurrency(transactionItem);

    const amount = getTransactionDetails(transactionItem)?.amount;
    let amountToDisplay = convertToDisplayString(amount, currency);
    if (isScanning(transactionItem)) {
        amountToDisplay = translate('iou.receiptStatusTitle');
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={amountToDisplay}
            style={[styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink0]}
        />
    );
}

export default TotalCell;
