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
    const initialSelectedValue = useInitialSelection(selectedItem?.value ? selectedItem.value : undefined, isVisible === undefined ? {resetOnFocus: true} : {resetDeps: [isVisible]});
    const initiallyFocusedItemKey = initialSelectedValue;

    const options = useMemo(() => {
        const mappedOptions = items.map((item) => ({value: item.value ?? '', alternateText: item.description, text: item.label ?? '', keyForList: item.value ?? ''}));
        const orderedOptions = moveInitialSelectionToTopByValue(mappedOptions, initialSelectedValue ? [initialSelectedValue] : []);

        return orderedOptions.map((item) => ({...item, isSelected: item.value === selectedItem?.value}));
    }, [initialSelectedValue, items, selectedItem?.value]);

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
