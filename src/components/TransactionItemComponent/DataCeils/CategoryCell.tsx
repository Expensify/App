import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import type TransactionDataCellProps from './TransactionDataCellProps';

function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();
    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={shouldShowTooltip}
            text={transactionItem?.category}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={transactionItem?.category ?? ''}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    );
}

CategoryCell.displayName = 'CategoryCell';
export default CategoryCell;
