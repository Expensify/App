import {NavigationRouteContext} from '@react-navigation/native';
import {useContext, useMemo} from 'react';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

type SearchStateResult = {
    isOnSearch: boolean;
    hashKey?: string;
};

/**
 * Hook to manage search state based on route parameters
 * Returns search status and hash for query tracking
 */
const useSearchState = (): SearchStateResult => {
    // We are using these contexts directly instead of useRoute, because those will throw an error if used outside a navigator.
    // const route = useContext(NavigationRouteContext) as PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;
    const route = useContext(NavigationRouteContext);
    const {q, type} = (route?.params as {q?: string; type?: string}) ?? {q: undefined, type: undefined};

    return useMemo(() => {
        const isSearchAttachmentModal = route?.name === SCREENS.ATTACHMENTS && type === CONST.ATTACHMENT_TYPE.SEARCH;

        if (!route) {
            return {isOnSearch: false, hashKey: undefined};
        }

        const queryJSON = q ? buildSearchQueryJSON(q) : ({} as {hash?: string});
        const hashKey = queryJSON?.hash ? String(queryJSON.hash) : undefined;
        const isOnSearch = ((route?.name === SCREENS.SEARCH.CENTRAL_PANE || route?.name === SCREENS.SEARCH.BOTTOM_TAB) && !!hashKey) || isSearchAttachmentModal;

        return {hashKey, isOnSearch};
    }, [q, type, route]);
};

export default useSearchState;
