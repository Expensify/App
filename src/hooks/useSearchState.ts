import {NavigationRouteContext} from '@react-navigation/native';
import {useContext, useMemo} from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

type SearchRouteParams = {
    q?: string;
    type?: string;
    hashKey?: number;
};

type SearchStateResult = {
    isOnSearch: boolean;
    hashKey?: number;
};

/**
 * Hook to manage search state based on route parameters
 * Returns search status and hash for query tracking
 */
const useSearchState = (): SearchStateResult => {
    // We are using these contexts directly instead of useRoute, because those will throw an error if used outside a navigator.
    const route = useContext(NavigationRouteContext);
    const {q, type, hashKey: hashKeyFromRoute} = (route?.params as SearchRouteParams) ?? {};

    return useMemo(() => {
        if (!route) {
            return {isOnSearch: false, hashKey: undefined};
        }

        const isSearchAttachmentModal = route?.name === SCREENS.ATTACHMENTS && type === CONST.ATTACHMENT_TYPE.SEARCH;
        const queryJSON = q ? buildSearchQueryJSON(q) : ({} as Partial<SearchQueryJSON>);
        // for attachment modal the hashKey is passed through route params, fallback to it if not found in queryJSON
        const hashKey = queryJSON?.hash ? queryJSON.hash : (hashKeyFromRoute ?? undefined);
        const isOnSearch = (route?.name === SCREENS.SEARCH.ROOT && !!hashKey) || isSearchAttachmentModal;

        return {hashKey, isOnSearch};
    }, [q, type, route, hashKeyFromRoute]);
};

export default useSearchState;
