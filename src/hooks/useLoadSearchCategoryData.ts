import {openSearchCategoryFiltersPage} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseLoadSearchCategoryDataParams = {
    /** Whether category data should be loaded. */
    shouldLoad?: boolean;

    /** Whether already loaded category data should be refreshed. */
    shouldRefresh?: boolean;
};

function useLoadSearchCategoryData({shouldLoad = true, shouldRefresh = false}: UseLoadSearchCategoryDataParams = {}) {
    const {isOffline} = useNetwork();
    const [areCategoriesLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED);
    const [isLoadingCategories] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_CATEGORY_DATA);
    const hasRequestedCategoryDataRef = useRef(false);
    const hasObservedCategoryRequestStateRef = useRef(!!areCategoriesLoaded || isLoadingCategories !== undefined);

    useEffect(() => {
        if (areCategoriesLoaded || isLoadingCategories !== undefined) {
            hasObservedCategoryRequestStateRef.current = true;
        }

        const wasCategoryRequestStateCleared = hasRequestedCategoryDataRef.current && hasObservedCategoryRequestStateRef.current && !areCategoriesLoaded && isLoadingCategories === undefined;
        if (wasCategoryRequestStateCleared) {
            hasRequestedCategoryDataRef.current = false;
            hasObservedCategoryRequestStateRef.current = false;
        }

        if (!shouldLoad) {
            hasRequestedCategoryDataRef.current = false;
            hasObservedCategoryRequestStateRef.current = false;
            return;
        }

        if (isLoadingCategories) {
            hasRequestedCategoryDataRef.current = true;
            return;
        }

        if (isOffline || hasRequestedCategoryDataRef.current || (areCategoriesLoaded && !shouldRefresh)) {
            return;
        }
        hasRequestedCategoryDataRef.current = true;
        openSearchCategoryFiltersPage();
    }, [areCategoriesLoaded, isLoadingCategories, isOffline, shouldLoad, shouldRefresh]);

    const isLoadingInitialCategories = shouldLoad && !areCategoriesLoaded && !isOffline && isLoadingCategories !== false;

    return {areCategoriesLoaded, isLoadingInitialCategories, isOffline};
}

export default useLoadSearchCategoryData;
