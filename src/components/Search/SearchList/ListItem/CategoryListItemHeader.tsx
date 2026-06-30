import React from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionCategoryGroupListItemType} from './types';

type CategoryListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The category currently being looked at */
    category: TransactionCategoryGroupListItemType;
};

function CategoryListItemHeader({category: categoryItem, ...baseProps}: CategoryListItemHeaderProps) {
    const {translate} = useLocalize();

    // formattedCategory is pre-decoded in SearchUIUtils, just translate empty values
    const rawCategory = categoryItem.formattedCategory ?? categoryItem.category;
    const categoryName = !rawCategory || rawCategory === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? translate('reportLayout.uncategorized') : rawCategory;

    return (
        <BaseListItemHeader
            {...baseProps}
            item={categoryItem}
            displayName={categoryName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.CATEGORY}
        />
    );
}

export default CategoryListItemHeader;
