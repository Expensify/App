import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import type TransactionDataCellProps from './TransactionDataCellProps';

function CategoryCell({isLargeScreenWidth, showTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem?.category ?? ''}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, {color: colors.green800}]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={showTooltip}
            text={transactionItem?.category}
            textStyle={[
                styles.optionDisplayName,
                styles.label,
                styles.pre,
                styles.justifyContentCenter,
                styles.textMicro,
                styles.textSupporting,
                styles.flexShrink1,
                styles.textMicro,
                styles.mnh0,
            ]}
        />
    );
}

CategoryCell.displayName = 'CategoryCell';
export default CategoryCell;
