import React, {useCallback, useMemo, useState} from 'react';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import SelectableListItem from '@components/SelectionList/SelectableListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {CategorySection} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';

type MultipleSelectionPickerProps = {
    items: string[];
    initiallySelectedItems: string[] | undefined;
    pickerTitle?: string;
    onSaveSelection: (values: string[]) => void;
};

function MultipleSelectionPicker({items, initiallySelectedItems, pickerTitle, onSaveSelection}: MultipleSelectionPickerProps) {
    const {translate} = useLocalize();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [noResultsFound, setNoResultsFound] = useState(false);

    const [selectedItems, setSelectedItems] = useState<string[]>(initiallySelectedItems ?? []);

    const sections = useMemo(() => {
        const newSections: CategorySection[] = [];
        const selectedItemsSection = selectedItems
            .filter((item) => item?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => localeCompare(a, b))
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: selectedItems?.includes(name) ?? false,
            }));
        const remainingItemsSection = items
            .filter((item) => selectedItems.includes(item) === false) // zwin
            .filter((item) => item?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()))
            .sort((a, b) => localeCompare(a, b)) // sprawdz sorta
            .map((name) => ({
                text: name,
                keyForList: name,
                isSelected: selectedItems?.includes(name) ?? false,
            }));
        console.log('%%%%%\n', 'selectedItemsSection.length', selectedItemsSection.length);
        console.log('%%%%%\n', 'remainingItemsSection.length', remainingItemsSection.length);
        if (selectedItemsSection.length === 0 && remainingItemsSection.length === 0) {
            console.log('%%%%%\n', 'i go to setNoResultsFound');
            setNoResultsFound(true);
        } else {
            console.log('%%%%%\n', 'set as true');
            setNoResultsFound(false);
        }
        newSections.push({
            title: undefined,
            data: selectedItemsSection,
            shouldShow: selectedItemsSection.length > 0,
        });
        newSections.push({
            title: pickerTitle,
            data: remainingItemsSection,
            shouldShow: remainingItemsSection.length > 0,
        });
        return newSections;
    }, [selectedItems, items, pickerTitle, debouncedSearchTerm]);
    console.log('%%%%%\n', 'sections', sections);
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
    console.log('%%%%%\n', 'noResultsFound', noResultsFound);

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
            textInputLabel={translate('common.search')}
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

MultipleSelectionPicker.displayName = 'MultipleSelectionPicker';

export default MultipleSelectionPicker;
