import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSuggestedSearches from '@hooks/useSuggestedSearches';

import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

import type {SearchQueryActionsValue, SearchQueryContextValue} from './types';

import {SearchQueryActionsContext, SearchQueryContext} from './SearchContextDefinitions';

type SearchQueryProviderProps = {
    children: React.ReactNode;
};

function selectSearchQueryParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.q as string | undefined) : undefined;
}

function selectSearchRawQueryParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.rawQuery as string | undefined) : undefined;
}

function SearchQueryProvider({children}: SearchQueryProviderProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the focused screen to avoid
    // re-renders from new object references returned by getDeepestFocusedScreen.
    const queryParam = useRootNavigationState((state) => selectSearchQueryParam(state ?? navigation.getState()));
    const rawQueryParam = useRootNavigationState((state) => selectSearchRawQueryParam(state ?? navigation.getState()));
    const definedQueryParam = usePreviousDefined(queryParam) ?? buildSearchQueryString();
    const currentSearchQueryJSON = buildSearchQueryJSON(definedQueryParam, rawQueryParam);

    // Build the suggested searches with the exact same scoping the type menu uses
    // (`createTypeMenuSections`), so the current query resolves to its search key. See `useSuggestedSearches`.
    const suggestedSearches = useSuggestedSearches();

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;
    const currentSearchKey = Object.values(suggestedSearches).find((search) => search.similarSearchHash === currentSimilarSearchHash)?.key;

    const [shouldResetSearchQuery, setShouldResetSearchQuery] = useState(false);

    const queryValue: SearchQueryContextValue = {
        currentSearchHash,
        currentSimilarSearchHash,
        currentSearchKey,
        currentSearchQueryJSON,
        suggestedSearches,
        shouldResetSearchQuery,
    };

    const queryActionsValue: SearchQueryActionsValue = {
        setShouldResetSearchQuery,
    };

    return (
        <SearchQueryContext value={queryValue}>
            <SearchQueryActionsContext value={queryActionsValue}>{children}</SearchQueryActionsContext>
        </SearchQueryContext>
    );
}

export default SearchQueryProvider;
