import {NavigationRouteContext} from '@react-navigation/native';
import {useContext, useMemo} from 'react';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import SCREENS from '@src/SCREENS';

type SearchResult = {
    isOnSearch: boolean;
    hashKey?: string;
};

/**
 * Hook to manage search state based on route parameters
 * Returns search status and hash for query tracking
 */
const useSearchState = (): SearchResult => {
    // We are using these contexts directly instead of useRoute, because those will throw an error if used outside a navigator.
    const route = useContext(NavigationRouteContext) as PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;
    const {q} = route?.params ?? {};

    return useMemo(() => {
        if (!route) {
            return {isOnSearch: false, hashKey: undefined};
        }

        const queryJSON = q ? buildSearchQueryJSON(q) : ({} as {hash?: string});
        const hashKey = queryJSON?.hash ? String(queryJSON.hash) : undefined;
        const isOnSearch = (route?.name === SCREENS.SEARCH.CENTRAL_PANE || route?.name === SCREENS.SEARCH.BOTTOM_TAB) && !!hashKey;

        return {hashKey, isOnSearch};
    }, [q, route]);
};

export default useSearchState;
