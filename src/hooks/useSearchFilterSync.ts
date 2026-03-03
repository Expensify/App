import {useEffect, useRef} from 'react';
import {updateAdvancedFilters} from '@libs/actions/Search';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

/**
 * Syncs computed filter form values to the SEARCH_ADVANCED_FILTERS_FORM Onyx key
 * whenever they change. Call from SearchFiltersBar which already computes formValues
 * via useFilterFormValues.
 */
function useSearchFilterSync(formValues: Partial<SearchAdvancedFiltersForm>, queryHash: number) {
    const lastSyncedQueryHashRef = useRef<number | null>(null);

    useEffect(() => {
        // Avoid overwriting in-progress edits in Advanced Filters.
        // We only resync when the underlying query itself changes.
        if (lastSyncedQueryHashRef.current === queryHash) {
            return;
        }
        lastSyncedQueryHashRef.current = queryHash;
        updateAdvancedFilters(formValues, true);
    }, [formValues, queryHash]);
}

export default useSearchFilterSync;
