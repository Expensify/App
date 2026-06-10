import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import useInitialSelection from '@hooks/useInitialSelection';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
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
    const initialSelectedValue = useInitialSelection(selectedItem?.value ? selectedItem.value : undefined, isVisible === undefined ? {resetOnFocus: true} : {isVisible});

    const options = useMemo(() => {
        const mappedOptions = items.map((item) => ({value: item.value ?? '', alternateText: item.description, text: item.label ?? '', keyForList: item.value ?? ''}));
        const orderedOptions = moveInitialSelectionToTop(mappedOptions, initialSelectedValue ? [initialSelectedValue] : []);

        return orderedOptions.map((item) => ({...item, isSelected: item.value === selectedItem?.value}));
    }, [initialSelectedValue, items, selectedItem?.value]);

    return (
        <SelectionList
            data={options}
            onSelectRow={(item) => onItemSelected?.(item)}
            initiallyFocusedItemKey={initialSelectedValue}
            shouldStopPropagation
            shouldShowTooltips={shouldShowTooltips}
            shouldScrollToFocusedIndexOnMount={false}
            ListItem={SingleSelectListItem}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            disableKeyboardShortcuts={disableKeyboardShortcuts}
            alternateNumberOfSupportedLines={alternateNumberOfSupportedLines}
        />
    );
}

export default ValueSelectionList;
