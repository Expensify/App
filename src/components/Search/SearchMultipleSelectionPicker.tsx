import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {useIsFocused} from '@react-navigation/native';
import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/ReportUtils';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';
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
    const isFocused = useIsFocused();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItems, setSelectedItems] = useState<SearchMultipleSelectionPickerItem[]>(initiallySelectedItems ?? []);
    const initialSelectedValuesRef = useRef<string[]>([]);
    const prevIsFocusedRef = useRef(false);
    const [selectionSnapshotVersion, setSelectionSnapshotVersion] = useState(0);

    useEffect(() => {
        setSelectedItems(initiallySelectedItems ?? []);
    }, [initiallySelectedItems]);

    useEffect(() => {
        const wasFocused = prevIsFocusedRef.current;
        if (isFocused && !wasFocused) {
            initialSelectedValuesRef.current = (initiallySelectedItems ?? []).map((item) => item.value.toString());
            setSelectionSnapshotVersion((version) => version + 1);
        }
        prevIsFocusedRef.current = isFocused;
    }, [isFocused, initiallySelectedItems]);

    const listData = useMemo(() => {
        const filteredItems = items.filter((item) => item?.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()));
        const sortedItems = filteredItems.sort((a, b) => sortOptionsWithEmptyValue(a.value.toString(), b.value.toString(), localeCompare));
        const mappedItems = sortedItems.map((item) => ({
            text: item.name,
            keyForList: item.value.toString(),
            isSelected: selectedItems.some((selectedItem) => selectedItem.value.toString() === item.value.toString()),
            value: item.value.toString(),
            leftElement: item.leftElement,
        }));

        const shouldReorderInitialSelection =
            !debouncedSearchTerm &&
            initialSelectedValuesRef.current.length > 0 &&
            mappedItems.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        if (!shouldReorderInitialSelection) {
            return mappedItems;
        }

        return moveInitialSelectionToTopByValue(mappedItems, initialSelectedValuesRef.current);
    }, [debouncedSearchTerm, initialSelectedValuesRef, items, localeCompare, selectedItems, selectionSnapshotVersion]);

    const noResultsFound = listData.length === 0 && !!debouncedSearchTerm;
    const sections = noResultsFound
        ? []
        : [
              {
                  title: pickerTitle,
                  data: listData,
                  sectionIndex: 0,
              },
          ];

    const onSelectItem = useCallback(
        (item: Partial<OptionData & SearchMultipleSelectionPickerItem>) => {
            if (!item.keyForList) {
                return;
            }

            const isItemSelected = selectedItems.some((selectedItem) => selectedItem.value.toString() === item.keyForList);

            if (isItemSelected) {
                setSelectedItems((prevSelectedItems) => prevSelectedItems.filter((selectedItem) => selectedItem.value.toString() !== item.keyForList));
                return;
            }

            const newItem = items.find((i) => i.value.toString() === item.keyForList);

            if (newItem) {
                setSelectedItems((prevSelectedItems) => [...prevSelectedItems, newItem]);
            }
        },
        [items, selectedItems],
    );

    const resetChanges = () => {
        setSelectedItems([]);
    };

    const applyChanges = () => {
        onSaveSelection(selectedItems.map((item) => item.value).flat());
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
            shouldShowLoadingPlaceholder={!noResultsFound}
            shouldStopPropagation
            shouldShowTooltips
            canSelectMultiple
            shouldScrollToTopOnSelect={false}
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
