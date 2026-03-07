import {useEffect} from 'react';
import {updateAdvancedFilters} from '@libs/actions/Search';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

/**
 * Syncs computed filter form values to the SEARCH_ADVANCED_FILTERS_FORM Onyx key
 * whenever they change. Call from SearchFiltersBar which already computes formValues
 * via useFilterFormValues.
 */
function useSearchFilterSync(formValues: Partial<SearchAdvancedFiltersForm>) {
    useEffect(() => {
        updateAdvancedFilters(formValues, true);
    }, [formValues]);
}

export default useSearchFilterSync;
