import React, {memo, useMemo} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

const CategoryCell = memo(function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const styles = useThemeStyles();

    // Memoize empty categories calculation
    const emptyCategories = useMemo(() => CONST.SEARCH.CATEGORY_EMPTY_VALUE.split(','), []);

    // Memoize category processing
    const categoryForDisplay = useMemo(() => {
        const category = transactionItem?.category ?? '';
        return emptyCategories.includes(category) ? '' : category;
    }, [transactionItem?.category, emptyCategories]);

    // Memoize narrow layout styles
    const narrowLayoutStyles = useMemo(() => [styles.textMicro, styles.mnh0], [styles.textMicro, styles.mnh0]);

    // Memoize wide layout styles
    const wideLayoutStyles = useMemo(
        () => [styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter],
        [styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter],
    );

    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            textStyle={narrowLayoutStyles}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            style={wideLayoutStyles}
        />
    );
});

CategoryCell.displayName = 'CategoryCell';
export default CategoryCell;
