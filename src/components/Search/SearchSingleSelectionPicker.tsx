import React, {useCallback, useEffect, useMemo, useState} from 'react';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SearchSingleSelectionPickerItem = {
    name: string;
    value: string;
};

type SearchSingleSelectionPickerProps = {
    items: SearchSingleSelectionPickerItem[];
    initiallySelectedItem: SearchSingleSelectionPickerItem | undefined;
    pickerTitle?: string;
    onSaveSelection: (value: string | undefined) => void;
    shouldShowTextInput?: boolean;
};

function SearchSingleSelectionPicker({items, initiallySelectedItem, pickerTitle, onSaveSelection, shouldShowTextInput = true}: SearchSingleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SearchSingleSelectionPickerItem | undefined>(initiallySelectedItem);

    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    const {sections, noResultsFound} = useMemo(() => {
        const selectedItemSection = selectedItem?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase())
            ? [{text: selectedItem.name, keyForList: selectedItem.value, isSelected: true, value: selectedItem.value}]
            : [];
        const remainingItemsSection = items
            .filter((item) => item?.value !== selectedItem?.value && item?.name?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare))
            .map((item) => ({
                text: item.name,
                keyForList: item.value,
                isSelected: false,
                value: item.value,
            }));
        const isEmpty = !selectedItemSection.length && !remainingItemsSection.length;
        return {
            sections: isEmpty
                ? []
                : [
                      {
                          title: undefined,
                          data: selectedItemSection,
                          shouldShow: selectedItemSection.length > 0,
                      },
                      {
                          title: pickerTitle,
                          data: remainingItemsSection,
                          shouldShow: remainingItemsSection.length > 0,
                      },
                  ],
            noResultsFound: isEmpty,
        };
    }, [selectedItem, items, pickerTitle, debouncedSearchTerm, localeCompare]);

    const onSelectItem = useCallback(
        (item: Partial<OptionData & SearchSingleSelectionPickerItem>) => {
            if (!item.text || !item.keyForList || !item.value) {
                return;
            }
            if (item.isSelected) {
                setSelectedItem(undefined);
            } else {
                setSelectedItem({name: item.text, value: item.value});
            }
        },
        [selectedItem],
    );

    const resetChanges = useCallback(() => {
        setSelectedItem(undefined);
    }, []);

    const applyChanges = useCallback(() => {
        onSaveSelection(selectedItem?.value);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [onSaveSelection, selectedItem]);

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
            ListItem={SingleSelectListItem}
        />
    );
}

SearchSingleSelectionPicker.displayName = 'SearchSingleSelectionPicker';

export default SearchSingleSelectionPicker;
export type {SearchSingleSelectionPickerItem};
