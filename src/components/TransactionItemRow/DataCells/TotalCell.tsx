import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isScanning} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TotalCell({shouldShowTooltip, transactionItem, reportCurrency: reportCurrencyProp}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Default: use the standard display amount and currency (handles modifiedAmount/modifiedCurrency).
    let amount = getTransactionDetails(transactionItem)?.amount;
    let currency = getTransactionCurrency(transactionItem);

    // Report layout: for foreign-currency transactions, show the converted amount in the
    // policy's output currency (reportCurrencyProp). Only applies when the transaction's
    // display currency differs from the output currency.
    if (transactionItem.convertedAmount && reportCurrencyProp && currency !== reportCurrencyProp) {
        amount = Math.abs(transactionItem.convertedAmount);
        currency = reportCurrencyProp;
    }

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
