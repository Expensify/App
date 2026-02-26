import React, {useState} from 'react';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SearchMultipleSelectionPickerItem = {
    name: string;
    value: string | string[];
    leftElement?: React.ReactNode;
};

type SearchMultipleSelectionPickerProps = {
    items: SearchMultipleSelectionPickerItem[];
    initiallySelectedItems: SearchMultipleSelectionPickerItem[] | undefined;
    pickerTitle?: string;
    onSaveSelection: (values: string[]) => void;
    shouldShowTextInput?: boolean;
};

function SearchMultipleSelectionPicker({items, initiallySelectedItems, pickerTitle, onSaveSelection, shouldShowTextInput = true}: SearchMultipleSelectionPickerProps) {
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const [selectedItemIDs, setSelectedItemIDs] = useState(() => new Set((initiallySelectedItems ?? []).map((item) => item.value.toString())));

    const searchLower = debouncedSearchTerm.toLowerCase();
    const selectedSectionData: Array<{text: string; keyForList: string; isSelected: boolean; value: string | string[]; leftElement?: React.ReactNode}> = [];
    const remainingSectionData: typeof selectedSectionData = [];
    for (const item of items) {
        if (!item.name.toLowerCase().includes(searchLower)) {
            continue;
        }
        const isSelected = selectedItemIDs.has(item.value.toString());
        (isSelected ? selectedSectionData : remainingSectionData).push({text: item.name, keyForList: item.name, isSelected, value: item.value, leftElement: item.leftElement});
    }

    const sortByValue = (a: {value: string | string[]}, b: {value: string | string[]}) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare);
    selectedSectionData.sort(sortByValue);
    remainingSectionData.sort(sortByValue);

    const noResultsFound = !selectedSectionData.length && !remainingSectionData.length;
    const sections = noResultsFound
        ? []
        : [
              {
                  title: undefined,
                  data: selectedSectionData,
                  sectionIndex: 0,
              },
              {
                  title: pickerTitle,
                  data: remainingSectionData,
                  sectionIndex: 1,
              },
          ];

    const onSelectItem = (item: Partial<OptionData & SearchMultipleSelectionPickerItem>) => {
        if (!item.text || !item.keyForList || !item.value) {
            return;
        }
        const id = item.value.toString();
        setSelectedItemIDs((prev) => {
            const next = new Set(prev);
            if (item.isSelected) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const resetChanges = () => {
        setSelectedItemIDs(new Set());
    };

    const applyChanges = () => {
        onSaveSelection(items.filter((item) => selectedItemIDs.has(item.value.toString())).flatMap((item) => item.value));
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };
    return (
        <SelectionListWithSections
            sections={sections}
            ListItem={MultiSelectListItem}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            onSelectRow={onSelectItem}
            showLoadingPlaceholder={!noResultsFound}
            shouldStopPropagation
            shouldShowTooltips
            canSelectMultiple
            footerContent={
                <SearchFilterPageFooterButtons
                    applyChanges={applyChanges}
                    resetChanges={resetChanges}
                />
            }
        />
    );
}

export default SearchMultipleSelectionPicker;
export type {SearchMultipleSelectionPickerItem};
