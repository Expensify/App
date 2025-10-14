import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ValueSelectionListProps} from './types';

function ValueSelectionList({items = [], selectedItem, onItemSelected, shouldShowTooltips = true}: ValueSelectionListProps) {
    const sections = useMemo(
        () => [{data: items.map((item) => ({value: item.value, alternateText: item.description, text: item.label ?? '', isSelected: item === selectedItem, keyForList: item.value ?? ''}))}],
        [items, selectedItem],
    );

    return (
        <SelectionList
            sections={sections}
            onSelectRow={(item) => onItemSelected?.(item)}
            initiallyFocusedOptionKey={selectedItem?.value}
            shouldStopPropagation
            shouldShowTooltips={shouldShowTooltips}
            shouldUpdateFocusedIndex
            ListItem={RadioListItem}
            addBottomSafeAreaPadding
        />
    );
}

ValueSelectionList.displayName = 'ValueSelectionList';

export default ValueSelectionList;
