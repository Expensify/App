import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import {getNoneOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import React, {useEffect, useState} from 'react';

import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SearchSingleSelectionPickerItem = {
    name: string;
    value: string;
    searchableText?: string;
};

type SearchSingleSelectionPickerProps = {
    items: SearchSingleSelectionPickerItem[];
    initiallySelectedItem: SearchSingleSelectionPickerItem | undefined;
    pickerTitle?: string;
    onSaveSelection: (value: string | undefined) => void;
    backToRoute?: Route;
    shouldAutoSave?: boolean;
    shouldShowTextInput?: boolean;
    allowNoneOption?: boolean;
};

function SearchSingleSelectionPicker({
    items,
    initiallySelectedItem,
    pickerTitle,
    onSaveSelection,
    backToRoute,
    shouldAutoSave,
    shouldShowTextInput = true,
    allowNoneOption = false,
}: SearchSingleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SearchSingleSelectionPickerItem | undefined>(initiallySelectedItem);
    const initialSelectedItem = useInitialSelection(initiallySelectedItem, {resetOnFocus: true});

    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    const searchLower = debouncedSearchTerm?.toLowerCase();
    const noneItem = allowNoneOption ? getNoneOption(debouncedSearchTerm, !selectedItem?.value, translate) : [];
    const initialSelectedItemMatchesSearch =
        !!initialSelectedItem && (initialSelectedItem.name.toLowerCase().includes(searchLower) || initialSelectedItem.searchableText?.toLowerCase().includes(searchLower));

    const initiallySelectedItemSection = initialSelectedItemMatchesSearch
        ? [
              {
                  text: initialSelectedItem.name,
                  keyForList: initialSelectedItem.value,
                  isSelected: selectedItem?.value === initialSelectedItem.value,
                  value: initialSelectedItem.value,
              },
          ]
        : [];

    const remainingItemsSection = items
        .filter((item) => item.value !== initialSelectedItem?.value && (item.name.toLowerCase().includes(searchLower) || item.searchableText?.toLowerCase().includes(searchLower)))
        .sort((a, b) => sortOptionsWithEmptyValue(a.name.toString(), b.name.toString(), localeCompare))
        .map((item) => ({
            text: item.name,
            keyForList: item.value,
            isSelected: selectedItem?.value === item.value,
            value: item.value,
        }));

    const noResultsFound = !noneItem.length && !initiallySelectedItemSection.length && !remainingItemsSection.length;

    const sections = noResultsFound
        ? []
        : [
              {
                  title: undefined,
                  data: [...initiallySelectedItemSection, ...noneItem],
                  sectionIndex: 0,
              },
              {
                  title: pickerTitle,
                  data: remainingItemsSection,
                  sectionIndex: 1,
              },
          ];

    const onSelectItem = (item: Partial<OptionData & SearchSingleSelectionPickerItem>) => {
        if (!item.text || !item.keyForList || item.value === undefined) {
            return;
        }
        if (shouldAutoSave) {
            onSaveSelection(item.isSelected ? '' : item.value);
            Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS);
            return;
        }
        if (!item.isSelected) {
            setSelectedItem({name: item.text, value: item.value});
        }
    };

    const resetChanges = () => {
        setSelectedItem(undefined);
    };

    const applyChanges = () => {
        onSaveSelection(selectedItem?.value);
        Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    const footerContent = (
        <SearchFilterPageFooterButtons
            applyChanges={applyChanges}
            resetChanges={resetChanges}
        />
    );

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };

    return (
        <SelectionListWithSections
            sections={sections}
            onSelectRow={onSelectItem}
            ListItem={SingleSelectListItem}
            initiallyFocusedItemKey={initialSelectedItem?.value}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            footerContent={shouldAutoSave ? undefined : footerContent}
            shouldShowLoadingPlaceholder={!noResultsFound}
            shouldUpdateFocusedIndex
            shouldStopPropagation
        />
    );
}

export default SearchSingleSelectionPicker;
export type {SearchSingleSelectionPickerItem};
