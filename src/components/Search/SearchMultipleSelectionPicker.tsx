import React, {useCallback, useEffect, useMemo, useState} from 'react';
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

    const orderedItems = useMemo(() => {
        const first: SearchMultipleSelectionPickerItem[] = [];

        const last: SearchMultipleSelectionPickerItem[] = [];

        const initiallySelectedValuesSet = new Set(initiallySelectedItems?.map((item) => item.value) ?? []);
        const sortedItems = items.sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare));
        for (const option of sortedItems) {
            if (option.value && initiallySelectedValuesSet.has(option.value)) {
                first.push(option);
            } else {
                last.push(option);
            }
        }
        return [...first, ...last];
    }, [initiallySelectedItems, items, localeCompare]);

    const {sections, noResultsFound} = useMemo(() => {
        if (!pickerTitle) {
            return {
                sections: [
                    {
                        data: orderedItems
                            .filter((item) => item?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
                            .map((item) => ({
                                text: item.name,
                                keyForList: item.name,
                                isSelected: selectedItems.some((selectedItem) => selectedItem.value.toString() === item.value.toString()),
                                value: item.value,
                            })),
                        shouldShow: orderedItems.length > 0,
                    },
                ],
                noResultsFound: false,
            };
        }

        const selectedItemsSection = selectedItems
            .filter((item) => item?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare))
            .map((item) => ({
                text: item.name,
                keyForList: item.name,
                isSelected: true,
                value: item.value,
            }));
        const remainingItemsSection = items
            .filter(
                (item) =>
                    !selectedItems.some((selectedItem) => selectedItem.value.toString() === item.value.toString()) && item?.name?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()),
            )
            .sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare))
            .map((item) => ({
                text: item.name,
                keyForList: item.name,
                isSelected: false,
                value: item.value,
            }));
        const isEmpty = !selectedItemsSection.length && !remainingItemsSection.length;
        return {
            sections: isEmpty
                ? []
                : [
                      {
                          title: undefined,
                          data: selectedItemsSection,
                          shouldShow: selectedItemsSection.length > 0,
                      },
                      {
                          title: pickerTitle,
                          data: remainingItemsSection,
                          shouldShow: remainingItemsSection.length > 0,
                      },
                  ],
            noResultsFound: isEmpty,
        };
    }, [pickerTitle, selectedItems, items, orderedItems, debouncedSearchTerm, localeCompare]);

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

SearchMultipleSelectionPicker.displayName = 'SearchMultipleSelectionPicker';

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
