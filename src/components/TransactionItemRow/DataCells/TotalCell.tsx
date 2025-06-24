import React, {memo, useMemo} from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isScanning} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

const TotalCell = memo(function TotalCell({shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Memoize expensive calculations to prevent unnecessary re-computations
    const transactionData = useMemo(() => {
        const currency = getTransactionCurrency(transactionItem);
        const amount = getTransactionDetails(transactionItem)?.amount;
        const isCurrentlyScanning = isScanning(transactionItem);

        if (isCurrentlyScanning) {
            return {
                amountToDisplay: translate('iou.receiptStatusTitle'),
                currency,
                amount,
                isScanning: true,
            };
        }

        return {
            amountToDisplay: convertToDisplayString(amount, currency),
            currency,
            amount,
            isScanning: false,
        };
    }, [transactionItem, translate]);

    // Memoize style array to prevent recreation
    const textStyles = useMemo(
        () => [styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink0],
        [styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink0],
    );

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={transactionData.amountToDisplay}
            style={textStyles}
        />
    );
});

TotalCell.displayName = 'TotalCell';
export default TotalCell;
