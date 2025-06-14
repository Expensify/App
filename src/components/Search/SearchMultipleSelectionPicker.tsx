import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SelectableListItem from '@components/SelectionList/SelectableListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
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
    const styles = useThemeStyles();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItems, setSelectedItems] = useState<SearchMultipleSelectionPickerItem[]>(initiallySelectedItems ?? []);

    useEffect(() => {
        setSelectedItems(initiallySelectedItems ?? []);
    }, [initiallySelectedItems]);

    const {sections, noResultsFound} = useMemo(() => {
        const itemsSection = items
            .filter((item) => item?.name?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => sortOptionsWithEmptyValue(a.value as string, b.value as string))
            .map((item) => ({
                text: item.name,
                keyForList: item.name,
                isSelected: selectedItems.some((selectedItem) => selectedItem.value === item.value),
                value: item.value,
            }));

        const isEmpty = !itemsSection.length;

        return {
            sections: isEmpty
                ? []
                : [
                      {
                          title: pickerTitle,
                          data: itemsSection,
                          shouldShow: itemsSection.length > 0,
                      },
                  ],
            noResultsFound: isEmpty,
        };
    }, [items, pickerTitle, debouncedSearchTerm, selectedItems]);

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
                style={[styles.mt4]}
                text={translate('common.save')}
                pressOnEnter
                onPress={handleConfirmSelection}
                large
            />
        ),
        [translate, handleConfirmSelection, styles.mt4],
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
            shouldScrollSelectedItemToTop={false}
            ListItem={SelectableListItem}
        />
    );
}

SearchMultipleSelectionPicker.displayName = 'SearchMultipleSelectionPicker';

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
