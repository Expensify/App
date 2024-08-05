import React, {useCallback, useMemo, useState} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import Button from './Button';
import SelectionList from './SelectionList';
import SelectableListItem from './SelectionList/SelectableListItem';

type MultipleSelectionPickerProps = {
    items: string[];
    initiallySelectedItems: string[] | undefined;
    pickerTitle?: string;
    onSaveSelection: (values: string[]) => void;
    shouldShowTextInput?: boolean;
};

function SearchMultipleSelectionPicker({items, initiallySelectedItems, pickerTitle, onSaveSelection, shouldShowTextInput = true}: MultipleSelectionPickerProps) {
    const {translate} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItems, setSelectedItems] = useState<string[]>(initiallySelectedItems ?? []);

    const {sections, noResultsFound} = useMemo(() => {
        const selectedItemsSection = selectedItems
            .filter((item) => item?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => localeCompare(a, b))
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: selectedItems?.includes(name) ?? false,
            }));
        const remainingItemsSection = items
            .filter((item) => selectedItems.includes(item) === false && item?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => localeCompare(a, b))
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: selectedItems?.includes(name) ?? false,
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

    const handleConfirmSelection = useCallback(() => {
        onSaveSelection(selectedItems);
        Navigation.goBack();
    }, [onSaveSelection, selectedItems]);

    const onSelectItem = useCallback(
        (item: Partial<OptionData>) => {
            if (!item.text) {
                return;
            }
            if (item.isSelected) {
                setSelectedItems(selectedItems?.filter((category) => category !== item.text));
            } else {
                setSelectedItems([...(selectedItems ?? []), item.text]);
            }
        },
        [selectedItems],
    );

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
