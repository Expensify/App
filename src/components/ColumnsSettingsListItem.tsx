// Selection rows shared by the expense and report column pickers.
import React from 'react';

import type {DraggableListRenderItemParams} from './DraggableList/types';
import type {SearchCustomColumnIds} from './Search/types';
import type {ListItemProps} from './SelectionList/ListItem/types';

import MultiSelectListItem from './SelectionList/ListItem/MultiSelectListItem';

type ColumnItem = {
    text: string;

    value: SearchCustomColumnIds;
    keyForList: SearchCustomColumnIds;

    isSelected: boolean;

    /** Required fields cannot be deselected, but can still be reordered. */
    isDisabled: boolean;

    isDragDisabled: boolean;

    leftElement: React.JSX.Element;
};

type ColumnsSettingsListItemProps = Pick<DraggableListRenderItemParams<ColumnItem>, 'item' | 'isFocused' | 'drag' | 'isActive'> & {
    onSelectRow: ListItemProps<ColumnItem>['onSelectRow'];
};

function ColumnsSettingsListItem({item, isFocused, onSelectRow}: ColumnsSettingsListItemProps) {
    return (
        <MultiSelectListItem
            item={item}
            isFocused={isFocused}
            showTooltip={false}
            onSelectRow={onSelectRow}
            isDisabled={item.isDisabled}
        />
    );
}

export default ColumnsSettingsListItem;
export type {ColumnItem, ColumnsSettingsListItemProps};
