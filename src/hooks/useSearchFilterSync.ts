import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {updateAdvancedFilters} from '@libs/actions/Search';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

/**
 * Syncs computed filter form values to the SEARCH_ADVANCED_FILTERS_FORM Onyx key
 * whenever they change. Call from SearchAdvanceFiltersButton which already computes formValues
 * via useFilterFormValues.
 *
 * The isFocused guard prevents the blurred (previous) SearchPage instance—kept
 * mounted during navigation transition animations—from overwriting the Onyx form
 * state that was already written by the newly focused instance.
 *
 * On narrow layout (iOS native), navigating to Advanced Filters causes this screen
 * to lose focus. When the user returns, the screen regains focus and this effect
 * would re-fire. Without the prevIsFocusedRef guard below, it would overwrite any
 * form changes made by Advanced Filters (e.g. resetting a date range) with stale
 * values derived from the unchanged URL query parameter.
 */
function useSearchFilterSync(formValues: Partial<SearchAdvancedFiltersForm>) {
    const isFocused = useIsFocused();
    const prevIsFocusedRef = useRef(isFocused);

    useEffect(() => {
        const wasPreviouslyFocused = prevIsFocusedRef.current;
        prevIsFocusedRef.current = isFocused;

        if (!isFocused) {
            return;
        }

        // Skip syncing when just regaining focus to avoid overwriting form
        // changes made while this screen was unfocused (e.g. Advanced Filters).
        if (!wasPreviouslyFocused) {
            return;
        }

        updateAdvancedFilters(formValues, true);
    }, [formValues, isFocused]);
}

export default useSearchFilterSync;
