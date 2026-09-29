import type {SearchQueryJSON} from '@components/Search/types';

import {updateAdvancedFilters} from '@libs/actions/Search';
import {getLastSyncedQuerySignature, setLastSyncedQuerySignature} from '@libs/SearchFilterSyncState';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';

import useOnyx from './useOnyx';

function shouldDeferSearchFilterSync(queryJSON: SearchQueryJSON, areCategoriesLoaded: boolean | undefined, isLoadingCategories: boolean | undefined, isOffline: boolean) {
    const hasCategoryFilter = queryJSON.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
    const isCategoryRequestPending = (!areCategoriesLoaded || isLoadingCategories === true) && isLoadingCategories !== false;
    return hasCategoryFilter && !isOffline && isCategoryRequestPending;
}

function shouldShowInitialCategoryFilterLoading(queryJSON: SearchQueryJSON, areCategoriesLoaded: boolean | undefined, isLoadingCategories: boolean | undefined, isOffline: boolean) {
    return !areCategoriesLoaded && shouldDeferSearchFilterSync(queryJSON, areCategoriesLoaded, isLoadingCategories, isOffline);
}

/**
 * Syncs computed filter form values to the SEARCH_ADVANCED_FILTERS_FORM Onyx
 * key when the URL query string actually changes. The form is the source for
 * the filter pills shown in the Search header — overwriting it on every
 * re-render (or every fresh mount with the same URL) would erase concurrent
 * Onyx.merge writes from Advanced Filters and leave the pill missing.
 */
function useSearchFilterSync(queryJSON: SearchQueryJSON | undefined, formValues: Partial<SearchAdvancedFiltersForm>, shouldDeferSync = false) {
    const isFocused = useIsFocused();
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const isSearchAdvancedFiltersFormMissing = !isLoadingOnyxValue(searchAdvancedFiltersFormMetadata) && searchAdvancedFiltersForm === undefined;

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        const querySig = queryJSON ? buildSearchQueryString(queryJSON) : null;
        if (shouldDeferSync) {
            setLastSyncedQuerySignature(null);
            return;
        }
        if (getLastSyncedQuerySignature() === querySig && !isSearchAdvancedFiltersFormMissing) {
            return;
        }
        setLastSyncedQuerySignature(querySig);
        updateAdvancedFilters(formValues, true);
    }, [queryJSON, formValues, isFocused, isSearchAdvancedFiltersFormMissing, shouldDeferSync]);
}

export default useSearchFilterSync;
export {shouldDeferSearchFilterSync, shouldShowInitialCategoryFilterLoading};
