import React from 'react';
import type {ListItem, TransactionTagGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import BaseListItemHeader, {type BaseListItemHeaderProps} from './BaseListItemHeader';

type TagListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The tag currently being looked at */
    tag: TransactionTagGroupListItemType;
};

function TagListItemHeader<TItem extends ListItem>({
    tag: tagItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: TagListItemHeaderProps<TItem>) {
    // formattedTag is already translated to "No tag" for empty values in SearchUIUtils
    const tagName = tagItem.formattedTag ?? tagItem.tag ?? '';

    return (
        <BaseListItemHeader
            item={tagItem}
            displayName={tagName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.TAG}
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

export default TagListItemHeader;
