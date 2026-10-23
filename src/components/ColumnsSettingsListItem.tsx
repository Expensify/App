// Selection rows shared by the expense and report column pickers.
import React from 'react';

import type {ColumnItem, ColumnsSettingsListItemProps} from './ColumnsSettingsListItem/types';

import MultiSelectListItem from './SelectionList/ListItem/MultiSelectListItem';

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
