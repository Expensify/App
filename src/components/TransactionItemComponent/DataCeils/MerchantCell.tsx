import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

function MerchantCell({transactionItem, showTooltip, isLargeScreenWidth}: TransactionDataCellProps) {
    const styles = useThemeStyles();

    const merchantToDisplay = !transactionItem?.merchant || transactionItem?.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? '' : transactionItem.merchant;
    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={merchantToDisplay ?? ''}
            style={[styles.pre, styles.justifyContentCenter, {color: colors.green800}, isLargeScreenWidth ? '' : styles.labelStrong]}
        />
    );
}

MerchantCell.displayName = 'MerchantCell';
export default MerchantCell;
