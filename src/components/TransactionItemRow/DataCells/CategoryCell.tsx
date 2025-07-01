import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();

    const emptyCategories = CONST.SEARCH.CATEGORY_EMPTY_VALUE.split(',');

    const category = transactionItem?.category ?? '';
    const categoryForDisplay = emptyCategories.includes(category) ? '' : category;

    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    );
}

CategoryCell.displayName = 'CategoryCell';
export default CategoryCell;
