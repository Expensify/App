import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
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
    shouldNavigateOnSave?: boolean;
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
    shouldNavigateOnSave = true,
    shouldShowTextInput = true,
    allowNoneOption = false,
}: SearchSingleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SearchSingleSelectionPickerItem | undefined>(initiallySelectedItem);

    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    const searchLower = debouncedSearchTerm?.toLowerCase();
    const noneItem =
        allowNoneOption && translate('common.none').toLowerCase().includes(searchLower)
            ? [
                  {
                      text: translate('common.none'),
                      keyForList: CONST.SEARCH.NONE_OPTION_KEY,
                      isSelected: !selectedItem?.value,
                      value: '',
                  },
              ]
            : [];

    const initiallySelectedItemSection =
        initiallySelectedItem?.name.toLowerCase().includes(searchLower) || initiallySelectedItem?.searchableText?.toLowerCase().includes(searchLower)
            ? [
                  {
                      text: initiallySelectedItem.name,
                      keyForList: initiallySelectedItem.value,
                      isSelected: selectedItem?.value === initiallySelectedItem.value,
                      value: initiallySelectedItem.value,
                  },
              ]
            : [];

    const remainingItemsSection = items
        .filter((item) => item.value !== initiallySelectedItem?.value && (item.name.toLowerCase().includes(searchLower) || item.searchableText?.toLowerCase().includes(searchLower)))
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
            if (item.isSelected && !allowNoneOption) {
                return;
            }
            const selectedValue = item.isSelected ? '' : item.value;
            onSaveSelection(selectedValue);
            if (shouldNavigateOnSave) {
                Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS);
            }
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
        if (shouldNavigateOnSave) {
            Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS);
        }
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
            initiallyFocusedItemKey={initiallySelectedItem?.value}
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
