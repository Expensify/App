import React from 'react';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionTagGroupListItemType} from './types';

type TagListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The tag currently being looked at */
    tag: TransactionTagGroupListItemType;
};

function TagListItemHeader({tag: tagItem, ...baseProps}: TagListItemHeaderProps) {
    // formattedTag is already translated to "No tag" for empty values in SearchUIUtils
    const tagName = tagItem.formattedTag ?? tagItem.tag ?? '';

    return (
        <BaseListItemHeader
            {...baseProps}
            item={tagItem}
            displayName={tagName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.TAG}
        />
    );
}

export default TagListItemHeader;
