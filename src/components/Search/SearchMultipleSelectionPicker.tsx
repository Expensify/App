import React, {useCallback, useEffect, useMemo, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import MultiSelectListItem from '@components/SelectionListWithSections/MultiSelectListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SearchMultipleSelectionPickerItem = {
    name: string;
    value: string | string[];
};

type SearchMultipleSelectionPickerProps = {
    items: SearchMultipleSelectionPickerItem[];
    initiallySelectedItems: SearchMultipleSelectionPickerItem[] | undefined;
    pickerTitle?: string;
    onSaveSelection: (values: string[]) => void;
    shouldShowTextInput?: boolean;
};

function SearchMultipleSelectionPicker({items, initiallySelectedItems, pickerTitle, onSaveSelection, shouldShowTextInput = true}: SearchMultipleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItems, setSelectedItems] = useState<SearchMultipleSelectionPickerItem[]>(initiallySelectedItems ?? []);

    useEffect(() => {
        setSelectedItems(initiallySelectedItems ?? []);
    }, [initiallySelectedItems]);

    const {sections, noResultsFound} = useMemo(() => {
        const filteredItems = items.filter((item) => item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

        const initialValues = new Set(initiallySelectedItems?.map((item) => item.value.toString()) ?? []);
        const selectedValues = new Set(selectedItems.map((item) => item.value.toString()));

        const initialItems: Array<{text: string; keyForList: string; isSelected: boolean; value: string | string[]}> = [];
        const remainingItems: Array<{text: string; keyForList: string; isSelected: boolean; value: string | string[]}> = [];

        const sortedItems = filteredItems.sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare));

        for (const item of sortedItems) {
            const mapped = {
                text: item.name,
                keyForList: item.name,
                isSelected: selectedValues.has(item.value.toString()),
                value: item.value,
            };
            if (!initialValues.size || !initialValues.has(item.value.toString())) {
                remainingItems.push(mapped);
            } else {
                initialItems.push(mapped);
            }
        }

        const shouldReorder = !debouncedSearchTerm.trim() && initialItems.length > 0;
        const data = shouldReorder ? [...initialItems, ...remainingItems] : [...initialItems, ...remainingItems];

        const isEmpty = data.length === 0;
        return {
            sections: isEmpty
                ? []
                : [
                      {
                          title: pickerTitle,
                          data,
                          shouldShow: true,
                      },
                  ],
            noResultsFound: isEmpty,
        };
    }, [selectedItems, items, pickerTitle, debouncedSearchTerm, localeCompare, initiallySelectedItems]);

    const onSelectItem = useCallback(
        (item: Partial<OptionData & SearchMultipleSelectionPickerItem>) => {
            if (!item.text || !item.keyForList || !item.value) {
                return;
            }
            if (item.isSelected) {
                setSelectedItems(selectedItems?.filter((selectedItem) => selectedItem.name !== item.keyForList));
            } else {
                setSelectedItems([...(selectedItems ?? []), {name: item.text, value: item.value}]);
            }
        },
        [selectedItems],
    );

    const resetChanges = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const applyChanges = useCallback(() => {
        onSaveSelection(selectedItems.map((item) => item.value).flat());
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onSaveSelection, selectedItems]);

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        ),
        [resetChanges, applyChanges],
    );
    return (
        <SelectionList
            sections={sections}
            textInputValue={searchTerm}
            onChangeText={setSearchTerm}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            onSelectRow={onSelectItem}
            headerMessage={noResultsFound ? translate('common.noResultsFound') : undefined}
            footerContent={footerContent}
            shouldStopPropagation
            showLoadingPlaceholder={!noResultsFound}
            shouldShowTooltips
            canSelectMultiple
            ListItem={MultiSelectListItem}
        />
    );
}

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
