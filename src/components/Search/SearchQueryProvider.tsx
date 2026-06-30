import {useNavigation} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/routers';
import React, {useEffect, useState} from 'react';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSuggestedSearches from '@hooks/useSuggestedSearches';
import {setSuggestedSearchOverride} from '@libs/actions/Search';
import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {doesQueryMatchSuggestedSearch, getSuggestedSearchKeyForQuery} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import SCREENS from '@src/SCREENS';
import {SearchQueryActionsContext, SearchQueryContext} from './SearchContextDefinitions';
import type {SearchQueryActionsValue, SearchQueryContextValue} from './types';

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

function selectSearchKeyParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.searchKey as SearchKey | undefined) : undefined;
}

function SearchQueryProvider({children}: SearchQueryProviderProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the focused screen to avoid
    // re-renders from new object references returned by getDeepestFocusedScreen.
    const queryParam = useRootNavigationState((state) => selectSearchQueryParam(state ?? navigation.getState()));
    const rawQueryParam = useRootNavigationState((state) => selectSearchRawQueryParam(state ?? navigation.getState()));
    const searchKeyParam = useRootNavigationState((state) => selectSearchKeyParam(state ?? navigation.getState()));
    const definedQueryParam = usePreviousDefined(queryParam) ?? buildSearchQueryString();
    const currentSearchQueryJSON = buildSearchQueryJSON(definedQueryParam, rawQueryParam);

    const suggestedSearches = useSuggestedSearches();

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;
    // Identity is derived from the query itself: a query belongs to a suggested search while it still contains
    // that search's defining filters. This stays correct no matter how the query was edited (chips, the search
    // bar, advanced filters) and releases the identity once a defining filter changes. The searchKey param is
    // used only as a tie-breaking hint, and only while it still matches the query.
    const paramMatchesQuery = !!searchKeyParam && doesQueryMatchSuggestedSearch(currentSearchQueryJSON, suggestedSearches[searchKeyParam]?.searchQueryJSON);
    const currentSearchKey = paramMatchesQuery ? searchKeyParam : getSuggestedSearchKeyForQuery(currentSearchQueryJSON, suggestedSearches);

    // Persist the current query (filters + columns) for the active suggested search so it sticks across
    // navigation. We only store deviations from the canned defaults; matching defaults clears the override.
    const suggestedSearchHash = currentSearchKey ? suggestedSearches[currentSearchKey]?.hash : undefined;
    useEffect(() => {
        if (!currentSearchKey || suggestedSearchHash === undefined) {
            return;
        }
        setSuggestedSearchOverride(currentSearchKey, currentSearchHash === suggestedSearchHash ? '' : definedQueryParam);
    }, [currentSearchKey, currentSearchHash, suggestedSearchHash, definedQueryParam]);

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
