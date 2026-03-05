import {useEffect, useMemo, useRef, useState} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {useIsFocused} from '@react-navigation/native';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/ListItem/types';

type SelectionItem = {
    name: string;
    value: string;
};

type RuleSelectionListItem = ListItem & {
    value: string;
};

type UseRuleSelectionListParams = {
    /** All options to display */
    items: SelectionItem[];

    /** Currently selected item */
    initiallySelectedItem?: SelectionItem;
};

type UseRuleSelectionListResult = {
    /** Sections ready for SelectionListWithSections */
    sections: Array<Section<RuleSelectionListItem>>;

    /** Whether search returned no results */
    noResultsFound: boolean;

    /** Current search value */
    searchTerm: string;

    /** Update search value */
    setSearchTerm: (value: string) => void;

    /** Selected item state */
    selectedItem?: SelectionItem;

    /** Update selected item state */
    setSelectedItem: (item?: SelectionItem) => void;

    /** Key to focus initially */
    initiallyFocusedItemKey?: string;
};

function useRuleSelectionList({items, initiallySelectedItem}: UseRuleSelectionListParams): UseRuleSelectionListResult {
    const {localeCompare} = useLocalize();
    const isFocused = useIsFocused();

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedItem, setSelectedItem] = useState<SelectionItem | undefined>(initiallySelectedItem);
    const initialSelectedValuesRef = useRef<string[]>([]);
    const prevIsFocusedRef = useRef(false);
    const [selectionSnapshotVersion, setSelectionSnapshotVersion] = useState(0);

    // Keep selection in sync with upstream value
    useEffect(() => {
        setSelectedItem(initiallySelectedItem);
    }, [initiallySelectedItem]);

    // Reset snapshot when screen gains focus so ordering reflects the selection at entry time
    useEffect(() => {
        const wasFocused = prevIsFocusedRef.current;
        if (isFocused && !wasFocused) {
            initialSelectedValuesRef.current = initiallySelectedItem ? [initiallySelectedItem.value] : [];
            setSelectionSnapshotVersion((version) => version + 1);
        }
        prevIsFocusedRef.current = isFocused;
    }, [initiallySelectedItem, isFocused]);

    const {sections, noResultsFound} = useMemo(() => {
        const normalizedSearch = debouncedSearchTerm?.toLowerCase() ?? '';

        const filteredItems = items
            .filter((item) => item.name.toLowerCase().includes(normalizedSearch))
            .sort((a, b) => sortOptionsWithEmptyValue(a.name.toString(), b.name.toString(), localeCompare));

        const mappedItems: RuleSelectionListItem[] = filteredItems.map((item) => ({
            text: item.name,
            keyForList: item.value,
            isSelected: selectedItem?.value === item.value,
            value: item.value,
        }));

        const shouldReorderInitialSelection =
            !normalizedSearch &&
            initialSelectedValuesRef.current.length > 0 &&
            mappedItems.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        const orderedItems = shouldReorderInitialSelection
            ? moveInitialSelectionToTopByValue(mappedItems, initialSelectedValuesRef.current)
            : mappedItems;

        const isEmpty = orderedItems.length === 0 && !!normalizedSearch;

        const preparedSections: Array<Section<RuleSelectionListItem>> = isEmpty
            ? []
            : [
                  {
                      data: orderedItems,
                      sectionIndex: 0,
                  },
              ];

        return {sections: preparedSections, noResultsFound: isEmpty};
    }, [debouncedSearchTerm, items, localeCompare, selectedItem?.value, selectionSnapshotVersion]);

    return {
        sections,
        noResultsFound,
        searchTerm,
        setSearchTerm,
        selectedItem,
        setSelectedItem,
        initiallyFocusedItemKey: initiallySelectedItem?.value,
    };
}

export default useRuleSelectionList;
export type {SelectionItem, RuleSelectionListItem};
