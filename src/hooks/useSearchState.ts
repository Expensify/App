import {useRoute} from '@react-navigation/native';
import {useMemo} from 'react';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {AuthScreensParamList} from '@libs/Navigation/types';
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
export const useSearchState = (): SearchResult => {
    const route = useRoute<PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>>();
    const {q} = route?.params || {};

    return useMemo(() => {
        const queryJSON = q ? buildSearchQueryJSON(q) : ({} as {hash?: string});
        const hashKey = queryJSON?.hash ? String(queryJSON.hash) : undefined;
        const isOnSearch = (route?.name === SCREENS.SEARCH.CENTRAL_PANE || route?.name === SCREENS.SEARCH.BOTTOM_TAB) && !!hashKey;

        return {hashKey, isOnSearch};
    }, [q, route?.name]);
};
