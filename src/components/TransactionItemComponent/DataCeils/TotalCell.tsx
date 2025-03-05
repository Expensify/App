import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import {getCurrency as getTransactionCurrency, hasReceipt, isReceiptBeingScanned} from '@libs/TransactionUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import TextWithTooltip from '@components/TextWithTooltip';
import type {TransactionListItemType} from '@components/SelectionList/types';
import colors from '@styles/theme/colors';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;

type TotalCellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    isChildListItem: boolean;
} & TransactionCellProps;

function TotalCell({showTooltip, isLargeScreenWidth, transactionItem}: TotalCellProps) {
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
