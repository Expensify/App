import {openSearchCategoryFiltersPage} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseLoadSearchCategoryDataParams = {
    shouldLoad?: boolean;
    shouldRefresh?: boolean;
};

function useLoadSearchCategoryData({shouldLoad = true, shouldRefresh = false}: UseLoadSearchCategoryDataParams = {}) {
    const {isOffline} = useNetwork();
    const [areCategoriesLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED);
    const [isLoadingCategories] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_CATEGORY_DATA);
    const hasRequestedCategoryDataRef = useRef(false);

    useEffect(() => {
        if (!shouldLoad) {
            hasRequestedCategoryDataRef.current = false;
            return;
        }

        if (isOffline || hasRequestedCategoryDataRef.current || (areCategoriesLoaded && !shouldRefresh)) {
            return;
        }
        hasRequestedCategoryDataRef.current = true;
        openSearchCategoryFiltersPage();
    }, [areCategoriesLoaded, isOffline, shouldLoad, shouldRefresh]);

    const isLoadingInitialCategories = shouldLoad && !areCategoriesLoaded && !isOffline && isLoadingCategories !== false;

    return {areCategoriesLoaded, isLoadingInitialCategories, isOffline};
}

export default useLoadSearchCategoryData;
