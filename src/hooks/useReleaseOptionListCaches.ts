import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import subscribeToRootNavigation from '@libs/Navigation/helpers/subscribeToRootNavigation';

import {useEffect, useRef} from 'react';

import {clearPersonalDetailOptionsCache} from './usePersonalDetailOptions';
import {clearPersonalDetailSearchSelectorCaches} from './usePersonalDetailSearchSelector/base';

function releaseOptionListCaches() {
    clearPersonalDetailOptionsCache();
    clearPersonalDetailSearchSelectorCaches();
}

/**
 * Releases the option lists cached for the people selectors once Search is done with them: when another tab takes over
 * from Search, and when another of its own tabs is selected. The lists are derived from Onyx and built again on demand,
 * so holding them beyond that only pins memory - tens of megabytes on an account with a large contact list.
 *
 * @param tabKey The selected tab of Search, or `undefined` while the query shown matches none of them.
 */
function useReleaseOptionListCaches(tabKey: string | undefined) {
    const previousTabKeyRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        // A query narrowed with filters belongs to no tab, and narrowing one is not leaving it, so the lists are
        // released only when the selection moves between tabs.
        if (!tabKey) {
            return;
        }

        const previousTabKey = previousTabKeyRef.current;
        previousTabKeyRef.current = tabKey;

        if (!previousTabKey || previousTabKey === tabKey) {
            return;
        }

        releaseOptionListCaches();
    }, [tabKey]);

    useEffect(() => {
        // Search stays mounted while another tab is on top of it, so leaving it shows up as a navigation state change
        // rather than as this hook being cleaned up. A right hand pane opening over Search keeps it the topmost tab.
        let wasSearchTopmostRoute = isSearchTopmostFullScreenRoute();

        return subscribeToRootNavigation(() => {
            const isSearchTopmostRoute = isSearchTopmostFullScreenRoute();
            if (isSearchTopmostRoute === wasSearchTopmostRoute) {
                return;
            }

            wasSearchTopmostRoute = isSearchTopmostRoute;

            if (isSearchTopmostRoute) {
                return;
            }

            releaseOptionListCaches();
        });
    }, []);
}

export default useReleaseOptionListCaches;
