import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';

import React from 'react';

import type ColumnsSettingsListItemProps from './types';

function ColumnsSettingsListItem({item, isFocused, onSelectRow}: ColumnsSettingsListItemProps) {
    return (
        <MultiSelectListItem
            item={item}
            isFocused={isFocused}
            isDisabled={item.isDisabled}
            showTooltip={false}
            onSelectRow={onSelectRow}
        />
    );
}

export default ColumnsSettingsListItem;
