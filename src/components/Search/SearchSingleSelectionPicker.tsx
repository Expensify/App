import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

type SearchSingleSelectionPickerItem = {
    name: string;
    value: string;
};

type SearchSingleSelectionPickerProps = {
    items: SearchSingleSelectionPickerItem[];
    initiallySelectedItem: SearchSingleSelectionPickerItem | undefined;
    pickerTitle?: string;
    onSaveSelection: (value: string | undefined) => void;
    backToRoute?: Route;
    shouldAutoSave?: boolean;
    shouldShowTextInput?: boolean;
};

function SearchSingleSelectionPicker({
    items,
    initiallySelectedItem,
    pickerTitle,
    onSaveSelection,
    backToRoute,
    shouldAutoSave,
    shouldShowTextInput = true,
}: SearchSingleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SearchSingleSelectionPickerItem | undefined>(initiallySelectedItem);

    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    const {sections, noResultsFound} = useMemo(() => {
        const initiallySelectedItemSection = initiallySelectedItem?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase())
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
            .filter((item) => item?.value !== initiallySelectedItem?.value && item?.name?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => sortOptionsWithEmptyValue(a.name.toString(), b.name.toString(), localeCompare))
            .map((item) => ({
                text: item.name,
                keyForList: item.value,
                isSelected: selectedItem?.value === item.value,
                value: item.value,
            }));
        const isEmpty = !initiallySelectedItemSection.length && !remainingItemsSection.length;
        return {
            sections: isEmpty
                ? []
                : [
                      {
                          title: undefined,
                          data: initiallySelectedItemSection,
                          sectionIndex: 0,
                      },
                      {
                          title: pickerTitle,
                          data: remainingItemsSection,
                          sectionIndex: 1,
                      },
                  ],
            noResultsFound: isEmpty,
        };
    }, [initiallySelectedItem, selectedItem?.value, items, pickerTitle, debouncedSearchTerm, localeCompare]);

    const onSelectItem = useCallback(
        (item: Partial<OptionData & SearchSingleSelectionPickerItem>) => {
            if (!item.text || !item.keyForList || !item.value) {
                return;
            }
            if (shouldAutoSave) {
                onSaveSelection(item.isSelected ? '' : item.value);
                Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                return;
            }
            if (!item.isSelected) {
                setSelectedItem({name: item.text, value: item.value});
            }
        },
        [shouldAutoSave, backToRoute, onSaveSelection],
    );

    const resetChanges = useCallback(() => {
        setSelectedItem(undefined);
    }, []);

    const applyChanges = useCallback(() => {
        onSaveSelection(selectedItem?.value);
        Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onSaveSelection, selectedItem?.value, backToRoute]);

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        ),
        [resetChanges, applyChanges],
    );

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };


    return (
        <SelectionList
            sections={sections}
            onSelectRow={onSelectItem}
            ListItem={SingleSelectListItem}
            initiallyFocusedItemKey={initiallySelectedItem?.value}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            footerContent={shouldAutoSave ? undefined : footerContent}
            showLoadingPlaceholder={!noResultsFound}
            shouldUpdateFocusedIndex
            shouldStopPropagation
        />
    );
}

export default SearchSingleSelectionPicker;
export type {SearchSingleSelectionPickerItem};
