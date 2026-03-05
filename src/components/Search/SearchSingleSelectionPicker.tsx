import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
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
    const {translate, localeCompare} = useLocalize();
    const isFocused = useIsFocused();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SearchSingleSelectionPickerItem | undefined>(initiallySelectedItem);
    const initialSelectedValuesRef = useRef<string[]>([]);
    const prevIsFocusedRef = useRef(false);
    const [selectionSnapshotVersion, setSelectionSnapshotVersion] = useState(0);

    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    useEffect(() => {
        const wasFocused = prevIsFocusedRef.current;
        if (isFocused && !wasFocused) {
            initialSelectedValuesRef.current = initiallySelectedItem ? [initiallySelectedItem.value] : [];
            setSelectionSnapshotVersion((version) => version + 1);
        }
        prevIsFocusedRef.current = isFocused;
    }, [initiallySelectedItem, isFocused]);

    const {listData, noResultsFound} = useMemo(() => {
        const filteredItems = items.filter((item) => item.name.toLowerCase().includes(debouncedSearchTerm?.toLowerCase()));
        const sortedItems = filteredItems.sort((a, b) => sortOptionsWithEmptyValue(a.name.toString(), b.name.toString(), localeCompare));

        const mappedItems = sortedItems.map((item) => ({
            text: item.name,
            keyForList: item.value,
            isSelected: selectedItem?.value === item.value,
            value: item.value,
        }));

        const shouldReorderInitialSelection =
            !debouncedSearchTerm &&
            initialSelectedValuesRef.current.length > 0 &&
            mappedItems.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        const orderedItems = shouldReorderInitialSelection ? moveInitialSelectionToTopByValue(mappedItems, initialSelectedValuesRef.current) : mappedItems;
        const isEmpty = orderedItems.length === 0 && !!debouncedSearchTerm;

        return {listData: orderedItems, noResultsFound: isEmpty};
    }, [debouncedSearchTerm, initialSelectedValuesRef, items, localeCompare, selectedItem?.value, selectionSnapshotVersion]);

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
        [backToRoute, onSaveSelection, shouldAutoSave],
    );

    const resetChanges = () => {
        setSelectedItem(undefined);
    };

    const applyChanges = () => {
        onSaveSelection(selectedItem?.value);
        Navigation.goBack(backToRoute ?? ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const footerContent = (
        <SearchFilterPageFooterButtons
            applyChanges={applyChanges}
            resetChanges={resetChanges}
        />
    );

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };

    return (
        <SelectionListWithSections
            sections={sections}
            onSelectRow={onSelectItem}
            ListItem={SingleSelectListItem}
            initiallyFocusedItemKey={initiallySelectedItem?.value}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            footerContent={shouldAutoSave ? undefined : footerContent}
            shouldShowLoadingPlaceholder={!noResultsFound}
            shouldUpdateFocusedIndex
            shouldStopPropagation
        />
    );
}

export default SearchSingleSelectionPicker;
export type {SearchSingleSelectionPickerItem};
