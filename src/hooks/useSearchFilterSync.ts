import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';
import {updateAdvancedFilters} from '@libs/actions/Search';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

/**
 * Syncs computed filter form values to the SEARCH_ADVANCED_FILTERS_FORM Onyx key
 * whenever they change. Call from SearchFiltersBar which already computes formValues
 * via useFilterFormValues.
 *
 * The isFocused guard prevents the blurred (previous) SearchPage instance—kept
 * mounted during navigation transition animations—from overwriting the Onyx form
 * state that was already written by the newly focused instance.
 */
function useSearchFilterSync(formValues: Partial<SearchAdvancedFiltersForm>) {
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        updateAdvancedFilters(formValues, true);
    }, [formValues, isFocused]);
}

export default useSearchFilterSync;
