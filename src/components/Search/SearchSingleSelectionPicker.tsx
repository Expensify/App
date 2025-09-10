import React, {useCallback, useEffect, useMemo, useState} from 'react';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
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
    const {translate} = useLocalize();

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
                          shouldShow: initiallySelectedItemSection.length > 0,
                          indexOffset: 0,
                      },
                      {
                          title: pickerTitle,
                          data: remainingItemsSection,
                          shouldShow: remainingItemsSection.length > 0,
                          indexOffset: initiallySelectedItemSection.length,
                      },
                  ],
            noResultsFound: isEmpty,
        };
    }, [initiallySelectedItem, selectedItem, items, pickerTitle, debouncedSearchTerm]);

    const onSelectItem = useCallback((item: Partial<OptionData & SearchSingleSelectionPickerItem>) => {
        if (!item.text || !item.keyForList || !item.value) {
            return;
        }
        if (!item.isSelected) {
            setSelectedItem({name: item.text, value: item.value});
        }
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(undefined);
    }, []);

    const applyChanges = useCallback(() => {
        onSaveSelection(selectedItem?.value);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
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
            initiallyFocusedOptionKey={initiallySelectedItem?.value}
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
            shouldUpdateFocusedIndex
        />
    );
}

SearchSingleSelectionPicker.displayName = 'SearchSingleSelectionPicker';

export default SearchSingleSelectionPicker;
export type {SearchSingleSelectionPickerItem};
