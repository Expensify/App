import {NavigationRouteContext} from '@react-navigation/native';
import {useContext, useMemo} from 'react';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

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
    // const route = useContext(NavigationRouteContext) as PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;
    const route = useContext(NavigationRouteContext);
    const {q, type, hashKey: hashKeyFromRoute} = (route?.params as {q?: string; type?: string; hashKey?: number}) ?? {q: undefined, type: undefined, hashKey: undefined};

    return useMemo(() => {
        const isSearchAttachmentModal = route?.name === SCREENS.ATTACHMENTS && type === CONST.ATTACHMENT_TYPE.SEARCH;

        if (!route) {
            return {isOnSearch: false, hashKey: undefined};
        }

        const queryJSON = q ? buildSearchQueryJSON(q) : ({} as Partial<SearchQueryJSON>);
        // for attachment modal the hashKey is passed through route params, fallback to it if not found in queryJSON
        const hashKey = queryJSON?.hash ? queryJSON.hash : hashKeyFromRoute ?? undefined;
        const isOnSearch = ((route?.name === SCREENS.SEARCH.CENTRAL_PANE || route?.name === SCREENS.SEARCH.BOTTOM_TAB) && !!hashKey) || isSearchAttachmentModal;

        return {hashKey, isOnSearch};
    }, [q, type, route, hashKeyFromRoute]);
};

export default useSearchState;
