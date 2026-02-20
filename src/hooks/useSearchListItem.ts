import {useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import {useSearchListItemsCacheRef} from '@components/Search/SearchListItemsCacheContext';
import type {SearchListItemDescriptor} from '@components/Search/types';
import type {SearchListItem} from '@components/SelectionListWithSections/types';

type UseSearchListItemResult = {
    item: SearchListItem | null;
    isSelected: boolean;
};

/**
 * Resolves full list item and selection state for a search list row from a descriptor.
 * Reads from the search list items cache (populated by Search when sortedData is computed)
 * and selection state from SearchContext. Use in each list row so only that row re-renders
 * when its data or selection changes, instead of the whole list.
 */
function useSearchListItem(descriptor: SearchListItemDescriptor): UseSearchListItemResult {
    const itemsCacheRef = useSearchListItemsCacheRef();
    const {selectedTransactions} = useSearchContext();

    return useMemo(() => {
        // Reading ref during render is intentional: cache is synced by parent when sortedData changes; we need it to resolve the item for this row.
        // eslint-disable-next-line react-hooks/refs -- cache ref is the source of truth for list items, updated by Search when sortedData changes
        const cache = itemsCacheRef?.current;
        const cachedItem = (cache?.get(descriptor.keyForList) ?? null) as SearchListItem | null;
        const isSelected = !!(cachedItem && selectedTransactions[descriptor.keyForList]?.isSelected);

        if (!cachedItem) {
            return {item: null, isSelected: false};
        }

        const itemWithSelection: SearchListItem = {...cachedItem, isSelected};
        return {item: itemWithSelection, isSelected};
    // eslint-disable-next-line rulesdir/prefer-narrow-hook-dependencies -- itemsCacheRef intentional: ref.current not in deps (ref updates don't trigger re-renders)
    }, [descriptor.keyForList, itemsCacheRef, selectedTransactions]);
}

export default useSearchListItem;
export type {UseSearchListItemResult};
