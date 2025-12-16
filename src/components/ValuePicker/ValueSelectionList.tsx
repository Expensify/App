import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ValueSelectionListProps} from './types';

function ValueSelectionList({items = [], selectedItem, onItemSelected, shouldShowTooltips = true}: ValueSelectionListProps) {
    const options = useMemo(
        () => items.map((item) => ({value: item.value, alternateText: item.description, text: item.label ?? '', isSelected: item === selectedItem, keyForList: item.value ?? ''})),
        [items, selectedItem],
    );

    return (
        <SelectionList
            data={options}
            onSelectRow={(item) => onItemSelected?.(item)}
            initiallyFocusedItemKey={selectedItem?.value}
            shouldStopPropagation
            shouldShowTooltips={shouldShowTooltips}
            shouldUpdateFocusedIndex
            ListItem={RadioListItem}
            addBottomSafeAreaPadding
        />
    );
}

export default ValueSelectionList;
