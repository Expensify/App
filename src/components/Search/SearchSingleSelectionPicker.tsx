import React, {useCallback, useEffect, useMemo, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
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
    const {translate} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SearchSingleSelectionPickerItem | undefined>(initiallySelectedItem);

    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    const {sections, noResultsFound} = useMemo(() => {
        const filteredItems = items.filter((item) => item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

        const data = filteredItems.map((item) => ({
            text: item.name,
            keyForList: item.value,
            isSelected: selectedItem?.value === item.value,
            value: item.value,
        }));

        // Only reorder on first load (when no search) using the initial item
        if (!debouncedSearchTerm.trim() && initiallySelectedItem) {
            const index = data.findIndex((item) => item.value === initiallySelectedItem.value);
            if (index > 0) {
                const [selectedRow] = data.splice(index, 1);
                data.unshift(selectedRow);
            }
        }

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
    }, [initiallySelectedItem, selectedItem?.value, items, pickerTitle, debouncedSearchTerm]);

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
    return (
        <SelectionList
            sections={sections}
            initiallyFocusedOptionKey={undefined}
            textInputValue={searchTerm}
            onChangeText={setSearchTerm}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            onSelectRow={onSelectItem}
            headerMessage={noResultsFound ? translate('common.noResultsFound') : undefined}
            footerContent={shouldAutoSave ? undefined : footerContent}
            shouldStopPropagation
            showLoadingPlaceholder={!noResultsFound}
            shouldShowTooltips
            ListItem={SingleSelectListItem}
            shouldUpdateFocusedIndex={false}
        />
    );
}

export default SearchSingleSelectionPicker;
export type {SearchSingleSelectionPickerItem};
