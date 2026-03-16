import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import type {ValueSelectionListProps} from './types';

function ValueSelectionList({
    items = [],
    selectedItem,
    onItemSelected,
    shouldShowTooltips = true,
    addBottomSafeAreaPadding = true,
    disableKeyboardShortcuts = false,
    alternateNumberOfSupportedLines,
    isVisible,
}: ValueSelectionListProps) {
    const initialSelectedValues = useInitialSelectionRef(selectedItem?.value ? [selectedItem.value] : [], isVisible === undefined ? {resetOnFocus: true} : {resetDeps: [isVisible]});
    const initiallyFocusedItemKey = initialSelectedValues.at(0);

    const mappedOptions = useMemo(() => items.map((item) => ({value: item.value ?? '', alternateText: item.description, text: item.label ?? '', keyForList: item.value ?? ''})), [items]);
    const orderedOptions = useMemo(() => moveInitialSelectionToTopByValue(mappedOptions, initialSelectedValues), [initialSelectedValues, mappedOptions]);
    const options = useMemo(() => orderedOptions.map((item) => ({...item, isSelected: item.value === selectedItem?.value})), [orderedOptions, selectedItem?.value]);

    return (
        <SelectionList
            data={options}
            onSelectRow={(item) => onItemSelected?.(item)}
            initiallyFocusedItemKey={initiallyFocusedItemKey}
            shouldStopPropagation
            shouldShowTooltips={shouldShowTooltips}
            shouldScrollToFocusedIndex={false}
            shouldScrollToFocusedIndexOnMount={false}
            ListItem={RadioListItem}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            disableKeyboardShortcuts={disableKeyboardShortcuts}
            alternateNumberOfSupportedLines={alternateNumberOfSupportedLines}
        />
    );
}

export default ValueSelectionList;
