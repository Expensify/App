import {openSearchVendorFiltersPage} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseLoadSearchVendorDataParams = {
    /** Whether vendor data should be loaded. */
    shouldLoad?: boolean;

    /** Whether already loaded vendor data should be refreshed. */
    shouldRefresh?: boolean;
};

function useLoadSearchVendorData({shouldLoad = true, shouldRefresh = false}: UseLoadSearchVendorDataParams = {}) {
    const {isOffline} = useNetwork();
    const [areVendorsLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_VENDOR_DATA_LOADED);
    const [isLoadingVendors] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_VENDOR_DATA);
    const hasRequestedVendorDataRef = useRef(false);
    const hasObservedVendorRequestStateRef = useRef(!!areVendorsLoaded || isLoadingVendors !== undefined);

    useEffect(() => {
        if (areVendorsLoaded || isLoadingVendors !== undefined) {
            hasObservedVendorRequestStateRef.current = true;
        }

        const wasVendorRequestStateCleared = hasRequestedVendorDataRef.current && hasObservedVendorRequestStateRef.current && !areVendorsLoaded && isLoadingVendors === undefined;
        if (wasVendorRequestStateCleared) {
            hasRequestedVendorDataRef.current = false;
            hasObservedVendorRequestStateRef.current = false;
        }

        if (!shouldLoad) {
            hasRequestedVendorDataRef.current = false;
            hasObservedVendorRequestStateRef.current = false;
            return;
        }

        if (isLoadingVendors) {
            hasRequestedVendorDataRef.current = true;
            return;
        }

        if (isOffline || hasRequestedVendorDataRef.current || (areVendorsLoaded && !shouldRefresh)) {
            return;
        }
        hasRequestedVendorDataRef.current = true;
        openSearchVendorFiltersPage();
    }, [areVendorsLoaded, isLoadingVendors, isOffline, shouldLoad, shouldRefresh]);

    const isLoadingInitialVendors = shouldLoad && !areVendorsLoaded && !isOffline && isLoadingVendors !== false;

    return {areVendorsLoaded, isLoadingInitialVendors, isOffline};
}

export default useLoadSearchVendorData;
