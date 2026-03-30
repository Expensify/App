import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useInitialSelection from '@hooks/useInitialSelection';
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
    const initialSelectedValue = useInitialSelection(selectedItem?.value || undefined, isVisible === undefined ? {resetOnFocus: true} : {resetDeps: [isVisible]});
    const initialSelectedValues = initialSelectedValue ? [initialSelectedValue] : [];
    const initiallyFocusedItemKey = initialSelectedValue;

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
