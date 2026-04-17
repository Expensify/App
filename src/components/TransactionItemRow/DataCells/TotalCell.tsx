import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isDeletedTransaction, isScanning} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TotalCell({shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const currency = getTransactionCurrency(transactionItem);

    const isDeleted = isDeletedTransaction(transactionItem);
    const amount = getTransactionDetails(transactionItem, undefined, undefined, isDeleted)?.amount;
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
