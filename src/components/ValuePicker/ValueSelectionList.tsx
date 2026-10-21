import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useSearchResults from '@hooks/useSearchResults';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import React, {useMemo} from 'react';

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
    const {translate} = useLocalize();
    const initialSelectedValue = useInitialSelection(selectedItem?.value ? selectedItem.value : undefined, isVisible === undefined ? {resetOnFocus: true} : {isVisible});

    const options = useMemo(() => {
        const mappedOptions = items.map((item) => ({
            value: item.value ?? '',
            alternateText: item.description,
            alternateTextComponent: item.alternateTextComponent,
            text: item.label ?? '',
            keyForList: item.value ?? '',
            isDisabled: item.isDisabled,
            rightElement: item.rightElement,
            shouldHideSelectionButton: item.shouldHideSelectionButton,
            titleStyles: item.titleStyles,
        }));
        const orderedOptions = moveInitialSelectionToTop(mappedOptions, initialSelectedValue ? [initialSelectedValue] : []);

        return orderedOptions.map((item) => ({...item, isSelected: item.value === selectedItem?.value}));
    }, [initialSelectedValue, items, selectedItem?.value]);

    const [searchValue, setSearchValue, filteredOptions] = useSearchResults(options, (option, searchInput) => tokenizedSearch([option], searchInput, () => [option.text]).length > 0);

    // The search input is gated on the unfiltered list length so it doesn't disappear once a query narrows the results.
    const isSearchable = options.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    return (
        <SelectionList
            data={filteredOptions}
            onSelectRow={(item) => onItemSelected?.(item)}
            textInputOptions={{
                label: isSearchable ? translate('common.search') : undefined,
                value: searchValue,
                onChangeText: setSearchValue,
                headerMessage: searchValue && filteredOptions.length === 0 ? translate('common.noResultsFound') : undefined,
            }}
            initiallyFocusedItemKey={initialSelectedValue}
            shouldStopPropagation
            shouldShowTooltips={shouldShowTooltips}
            shouldScrollToFocusedIndexOnMount={false}
            shouldUpdateFocusedIndex={isSearchable}
            disableMaintainingScrollPosition={isSearchable}
            ListItem={SingleSelectListItem}
            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            disableKeyboardShortcuts={disableKeyboardShortcuts}
            alternateNumberOfSupportedLines={alternateNumberOfSupportedLines}
        />
    );
}

export default ValueSelectionList;
