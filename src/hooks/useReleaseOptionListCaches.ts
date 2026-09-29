import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import subscribeToRootNavigation from '@libs/Navigation/helpers/subscribeToRootNavigation';

import {useEffect} from 'react';

import {clearPersonalDetailOptionsCache} from './usePersonalDetailOptions';
import {clearPersonalDetailSearchSelectorCaches} from './usePersonalDetailSearchSelector/base';

/**
 * Releases the option lists cached for the people selectors once another tab takes over from Search. The lists are
 * derived from Onyx and built again on demand, so holding them beyond that only pins memory - tens of megabytes on an
 * account with a large contact list.
 */
function useReleaseOptionListCaches() {
    useEffect(() => {
        // Search stays mounted while another tab is on top of it, so leaving it shows up as a navigation state change
        // rather than as this hook being cleaned up. A right hand pane opening over Search keeps it the topmost tab.
        let wasSearchTopmostRoute = isSearchTopmostFullScreenRoute();

        return subscribeToRootNavigation(() => {
            const isSearchTopmostRoute = isSearchTopmostFullScreenRoute();
            const hasLeftSearch = wasSearchTopmostRoute && !isSearchTopmostRoute;
            wasSearchTopmostRoute = isSearchTopmostRoute;

            if (!hasLeftSearch) {
                return;
            }

            clearPersonalDetailOptionsCache();
            clearPersonalDetailSearchSelectorCaches();
        });
    }, []);
}

export default useReleaseOptionListCaches;
