import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import {getDescription as getTransactionDescription, hasReceipt, isReceiptBeingScanned} from '@libs/TransactionUtils';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import TextWithTooltip from '@components/TextWithTooltip';
import type {TransactionListItemType} from '@components/SelectionList/types';
import React from 'react';
import useTheme from '@hooks/useTheme';
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

function MerchantCell({transactionItem, showTooltip, isLargeScreenWidth}: TransactionCellProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const merchantToDisplay = !transactionItem?.merchant || transactionItem?.merchant === "(none)" ? '' : transactionItem.merchant;
    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={merchantToDisplay ?? ''}
            style={[styles.pre, styles.justifyContentCenter,styles.labelStrong,{color:colors.green800}]}
        />
    );
}

MerchantCell.displayName = 'MerchantCell';
export default MerchantCell;
