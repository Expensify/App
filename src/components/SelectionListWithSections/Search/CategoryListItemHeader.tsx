import React from 'react';
import type {ListItem, TransactionCategoryGroupListItemType} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';

type CategoryListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The category currently being looked at */
    category: TransactionCategoryGroupListItemType;
};

function CategoryListItemHeader<TItem extends ListItem>({
    category: categoryItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: CategoryListItemHeaderProps<TItem>) {
    const {translate} = useLocalize();

    // formattedCategory is pre-decoded in SearchUIUtils, just translate empty values
    const rawCategory = categoryItem.formattedCategory ?? categoryItem.category;
    const categoryName = !rawCategory || rawCategory === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? translate('reportLayout.uncategorized') : rawCategory;

    return (
        <BaseListItemHeader
            item={categoryItem}
            displayName={categoryName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.CATEGORY}
            onCheckboxPress={onCheckboxPress}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
            isSelectAllChecked={isSelectAllChecked}
            isIndeterminate={isIndeterminate}
            isExpanded={isExpanded}
            onDownArrowClick={onDownArrowClick}
            columns={columns}
        />
    );
}

export default CategoryListItemHeader;
