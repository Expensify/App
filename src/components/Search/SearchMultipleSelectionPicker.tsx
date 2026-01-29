import React, {useEffect, useState} from 'react';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
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

    const noResultsFound = !selectedItemsSection.length && !remainingItemsSection.length;
    const sections = noResultsFound
        ? []
        : [
              {
                  title: undefined,
                  data: selectedItemsSection,
                  sectionIndex: 0,
              },
              {
                  title: pickerTitle,
                  data: remainingItemsSection,
                  sectionIndex: 1,
              },
          ];

    const onSelectItem = (item: Partial<OptionData & SearchMultipleSelectionPickerItem>) => {
        if (!item.text || !item.keyForList || !item.value) {
            return;
        }
        if (item.isSelected) {
            setSelectedItems(selectedItems?.filter((selectedItem) => selectedItem.name !== item.keyForList));
        } else {
            setSelectedItems([...(selectedItems ?? []), {name: item.text, value: item.value}]);
        }
    };

    const resetChanges = () => {
        setSelectedItems([]);
    };

    const applyChanges = () => {
        onSaveSelection(selectedItems.map((item) => item.value).flat());
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };
    return (
        <SelectionList
            sections={sections}
            ListItem={MultiSelectListItem}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            onSelectRow={onSelectItem}
            showLoadingPlaceholder={!noResultsFound}
            shouldStopPropagation
            shouldShowTooltips
            canSelectMultiple
            footerContent={
                <SearchFilterPageFooterButtons
                    applyChanges={applyChanges}
                    resetChanges={resetChanges}
                />
            }
        />
    );
}

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
