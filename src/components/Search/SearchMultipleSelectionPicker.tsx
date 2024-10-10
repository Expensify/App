import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SelectableListItem from '@components/SelectionList/SelectableListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
    const {translate} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItems, setSelectedItems] = useState<SearchMultipleSelectionPickerItem[]>(initiallySelectedItems ?? []);

    const sortOptionsWithNoneValue = (a: SearchMultipleSelectionPickerItem, b: SearchMultipleSelectionPickerItem) => {
        // Always show `No category` and `No tag` as the first option
        if (a.value === CONST.SEARCH.EMPTY_VALUE) {
            return -1;
        }
        if (b.value === CONST.SEARCH.EMPTY_VALUE) {
            return 1;
        }
        return localeCompare(a.name, b.name);
    };

    useEffect(() => {
        setSelectedItems(initiallySelectedItems ?? []);
    }, [initiallySelectedItems]);

    const {sections, noResultsFound} = useMemo(() => {
        const selectedItemsSection = selectedItems
            .filter((item) => item?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => sortOptionsWithNoneValue(a, b))
            .map((item) => ({
                text: item.name,
                keyForList: item.name,
                isSelected: true,
                value: item.value,
            }));
        const remainingItemsSection = items
            .filter((item) => selectedItems.some((selectedItem) => selectedItem.value === item.value) === false && item?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => sortOptionsWithNoneValue(a, b))
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
    }, [selectedItems, items, pickerTitle, debouncedSearchTerm]);

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

    const handleConfirmSelection = useCallback(() => {
        onSaveSelection(selectedItems.map((item) => item.value).flat());
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [onSaveSelection, selectedItems]);

    const footerContent = useMemo(
        () => (
            <Button
                success
                text={translate('common.save')}
                pressOnEnter
                onPress={handleConfirmSelection}
                large
            />
        ),
        [translate, handleConfirmSelection],
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
            ListItem={SelectableListItem}
        />
    );
}

SearchMultipleSelectionPicker.displayName = 'SearchMultipleSelectionPicker';

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
