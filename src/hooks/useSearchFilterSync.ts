import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

/**
 * Module-level: tracks the last URL query signature that was synced into the
 * SEARCH_ADVANCED_FILTERS_FORM Onyx key. We deliberately keep this outside the
 * hook so it survives unmount/remount of SearchAdvancedFiltersButton. The
 * button is gated by SearchActionsBarSwitch (`showStatic` flips during
 * `startTransition` after navigation) which causes the hook to remount and
 * would otherwise reset a per-component ref to null — causing the sync to
 * fire again with form values derived from the *old* URL, clobbering any
 * Onyx.merge that was just done by the Advanced Filters flow (e.g. Save Date
 * before the URL has been replaced by View Results).
 */
let lastSyncedQuerySig: string | null = null;

/**
 * Syncs computed filter form values to the SEARCH_ADVANCED_FILTERS_FORM Onyx
 * key when the URL query string actually changes. The form is the source for
 * the filter pills shown in the Search header — overwriting it on every
 * re-render (or every fresh mount with the same URL) would erase concurrent
 * Onyx.merge writes from Advanced Filters and leave the pill missing.
 */
function useSearchFilterSync(queryJSON: SearchQueryJSON | undefined, formValues: Partial<SearchAdvancedFiltersForm>) {
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        const querySig = queryJSON ? buildSearchQueryString(queryJSON) : null;
        if (lastSyncedQuerySig === querySig) {
            return;
        }
        lastSyncedQuerySig = querySig;
        updateAdvancedFilters(formValues, true);
    }, [queryJSON, formValues, isFocused]);
}

export default useSearchFilterSync;
