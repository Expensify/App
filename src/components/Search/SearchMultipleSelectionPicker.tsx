import React, {useEffect, useState} from 'react';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

type SearchMultipleSelectionPickerItem<T> = {
    name: string;
    value: T;
    leftElement?: React.ReactNode;
};

type SearchMultipleSelectionPickerProps<T> = {
    items: Array<SearchMultipleSelectionPickerItem<T>>;
    initiallySelectedItems: Array<SearchMultipleSelectionPickerItem<T>> | undefined;
    pickerTitle?: string;
    onSaveSelection: (values: [T] extends [string[]] ? T : T[]) => void;
    shouldShowTextInput?: boolean;
};

function SearchMultipleSelectionPicker<T extends string | string[]>({
    items,
    initiallySelectedItems,
    pickerTitle,
    onSaveSelection,
    shouldShowTextInput = true,
}: SearchMultipleSelectionPickerProps<T>) {
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const [initialSelectedIDs] = useState(() => new Set((initiallySelectedItems ?? []).map((item) => item.value.toString())));
    const [selectedItemIDs, setSelectedItemIDs] = useState(() => initialSelectedIDs);
    // Clear after mount to prevent FlashList from auto-scrolling when data changes
    // cause the key to transition from "not found" to "found" (e.g., clearing a search).
    // Deferred by one frame so FlashList processes the initial scroll first.
    const [initiallyFocusedKey, setInitiallyFocusedKey] = useState(() => {
        let minItem: SearchMultipleSelectionPickerItem<T> | undefined;
        for (const item of items) {
            if (initialSelectedIDs.has(item.value.toString())) {
                if (!minItem || sortOptionsWithEmptyValue(item.value.toString(), minItem.value.toString(), localeCompare) < 0) {
                    minItem = item;
                }
            }
        }
        return minItem?.name;
    });
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setInitiallyFocusedKey(undefined);
        });
        return () => cancelAnimationFrame(id);
    }, []);

    const searchLower = debouncedSearchTerm.toLowerCase();
    const sectionData: Array<{text: string; keyForList: string; isSelected: boolean; value: T; leftElement?: React.ReactNode}> = [];
    for (const item of items) {
        if (!item.name.toLowerCase().includes(searchLower)) {
            continue;
        }
        const isSelected = selectedItemIDs.has(item.value.toString());
        sectionData.push({text: item.name, keyForList: item.name, isSelected, value: item.value, leftElement: item.leftElement});
    }

    sectionData.sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare));

    const noResultsFound = !sectionData.length;
    const sections = noResultsFound
        ? []
        : [
              {
                  title: pickerTitle,
                  data: sectionData,
                  sectionIndex: 0,
              },
          ];

    const onSelectItem = (item: Partial<OptionData & SearchMultipleSelectionPickerItem<T>>) => {
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
        onSaveSelection(items.filter((item) => selectedItemIDs.has(item.value.toString())).flatMap((item) => item.value) as [T] extends [string[]] ? T : T[]);
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
            initiallyFocusedItemKey={initiallyFocusedKey}
            shouldClearInputOnSelect={false}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            onSelectRow={onSelectItem}
            shouldShowLoadingPlaceholder={!noResultsFound}
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
