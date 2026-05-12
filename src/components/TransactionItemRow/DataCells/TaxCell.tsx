import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTaxAmount, getCurrency as getTransactionCurrency} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TaxCell({transactionItem, shouldShowTooltip}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();

    const taxAmount = getTaxAmount(transactionItem, true);
    const currency = getTransactionCurrency(transactionItem);

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={convertToDisplayString(taxAmount, currency)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}
        />
    );
}

export default TaxCell;
