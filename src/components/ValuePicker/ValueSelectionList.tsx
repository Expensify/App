import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
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
            ListItem={SingleSelectListItem}
            addBottomSafeAreaPadding
        />
    );
}

ValueSelectionList.displayName = 'ValueSelectionList';

export default ValueSelectionList;
