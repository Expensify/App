import useThemeStyles from '@hooks/useThemeStyles';
import TextWithTooltip from '@components/TextWithTooltip';
import React from 'react';
import colors from '@styles/theme/colors';
import type DataCellProps from './DateCellProps';

function MerchantCell({transactionItem, showTooltip, isLargeScreenWidth}: DataCellProps) {
    const styles = useThemeStyles();

    const merchantToDisplay = !transactionItem?.merchant || transactionItem?.merchant === "(none)" ? '' : transactionItem.merchant;
    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={merchantToDisplay ?? ''}
            style={[styles.pre, styles.justifyContentCenter,{color:colors.green800}, isLargeScreenWidth?'': styles.labelStrong]}
        />
    );
}

MerchantCell.displayName = 'MerchantCell';
export default MerchantCell;
