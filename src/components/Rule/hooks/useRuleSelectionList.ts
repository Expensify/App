import {useMemo} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useLocalize from '@hooks/useLocalize';
import {sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';

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

    /** Key to focus initially */
    initiallyFocusedItemKey?: string;
};

function useRuleSelectionList({items, initiallySelectedItem}: UseRuleSelectionListParams): UseRuleSelectionListResult {
    const {localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const initialSelectedValues = useInitialSelectionRef(initiallySelectedItem ? [initiallySelectedItem.value] : [], {resetOnFocus: true});

    const normalizedSearch = debouncedSearchTerm?.toLowerCase() ?? '';

    const sortedItems = useMemo(
        () => items.filter((item) => item.name.toLowerCase().includes(normalizedSearch)).sort((a, b) => sortOptionsWithEmptyValue(a.name.toString(), b.name.toString(), localeCompare)),
        [items, localeCompare, normalizedSearch],
    );

    const orderedItems = useMemo(() => {
        const mappedItems = sortedItems.map((item) => ({
            text: item.name,
            keyForList: item.value,
            value: item.value,
        }));

        const shouldShowStaleSelectedItem =
            !!initiallySelectedItem &&
            !sortedItems.some((item) => item.value === initiallySelectedItem.value) &&
            (!normalizedSearch || initiallySelectedItem.name.toLowerCase().includes(normalizedSearch));

        const itemsForDisplay = shouldShowStaleSelectedItem
            ? [
                  {
                      text: initiallySelectedItem.name,
                      keyForList: initiallySelectedItem.value,
                      value: initiallySelectedItem.value,
                  },
                  ...mappedItems,
              ]
            : mappedItems;

        const shouldReorderInitialSelection = !normalizedSearch && initialSelectedValues.length > 0 && itemsForDisplay.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;

        return shouldReorderInitialSelection ? moveInitialSelectionToTopByValue(itemsForDisplay, initialSelectedValues) : itemsForDisplay;
    }, [initialSelectedValues, initiallySelectedItem, normalizedSearch, sortedItems]);

    const listData = useMemo<RuleSelectionListItem[]>(
        () =>
            orderedItems.map((item) => ({
                ...item,
                isSelected: initiallySelectedItem?.value === item.value,
            })),
        [initiallySelectedItem?.value, orderedItems],
    );

    const {sections, noResultsFound} = useMemo(() => {
        const hasNoItems = listData.length === 0;
        const isSearchMiss = !!normalizedSearch && hasNoItems;

        const preparedSections: Array<Section<RuleSelectionListItem>> = hasNoItems
            ? []
            : [
                  {
                      data: listData,
                      sectionIndex: 0,
                  },
              ];

        return {sections: preparedSections, noResultsFound: isSearchMiss};
    }, [listData, normalizedSearch]);

    return {
        sections,
        noResultsFound,
        searchTerm,
        setSearchTerm,
        initiallyFocusedItemKey: initialSelectedValues.at(0),
    };
}

export default useRuleSelectionList;
export type {SelectionItem, RuleSelectionListItem};
