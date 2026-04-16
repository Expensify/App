import React from 'react';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedLeafCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const styles = useThemeStyles();

    const categoryForDisplay = isCategoryMissing(transactionItem?.category) ? '' : getDecodedLeafCategoryName(transactionItem?.category ?? '');

    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={icons.Folder}
            showTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            numberOfLines={1}
            style={[styles.lineHeightLarge, styles.justifyContentCenter]}
        />
    );
}

export default CategoryCell;
