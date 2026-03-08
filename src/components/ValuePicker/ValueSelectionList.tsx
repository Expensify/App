import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';
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
    const options = useMemo(() => {
        const mappedOptions = items.map((item) => ({
            value: item.value ?? '',
            alternateText: item.description,
            text: item.label ?? '',
            isSelected: item.value === selectedItem?.value,
            keyForList: item.value ?? '',
        }));

        const shouldReorderInitialSelection = initialSelectedValues.length > 0 && mappedOptions.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        return shouldReorderInitialSelection ? moveInitialSelectionToTopByValue(mappedOptions, initialSelectedValues) : mappedOptions;
    }, [initialSelectedValues, items, selectedItem?.value]);

    return (
        <SelectionList
            data={options}
            onSelectRow={(item) => onItemSelected?.(item)}
            initiallyFocusedItemKey={selectedItem?.value}
            shouldStopPropagation
            shouldShowTooltips={shouldShowTooltips}
            shouldUpdateFocusedIndex
            ListItem={RadioListItem}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            disableKeyboardShortcuts={disableKeyboardShortcuts}
            alternateNumberOfSupportedLines={alternateNumberOfSupportedLines}
        />
    );
}

export default ValueSelectionList;
