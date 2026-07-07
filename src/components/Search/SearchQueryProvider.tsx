import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSuggestedSearches from '@hooks/useSuggestedSearches';

import {setSuggestedSearchOverride} from '@libs/actions/Search';
import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {doesQueryMatchSuggestedSearch, getSavedSearchKeyForQuery, getSuggestedSearchKeyForQuery} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';

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

function selectSearchKeyParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.searchKey as SearchKey | undefined) : undefined;
}

function selectSavedSearchKeyParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.savedSearchKey as string | undefined) : undefined;
}

function SearchQueryProvider({children}: SearchQueryProviderProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the focused screen to avoid
    // re-renders from new object references returned by getDeepestFocusedScreen.
    const queryParam = useRootNavigationState((state) => selectSearchQueryParam(state ?? navigation.getState()));
    const rawQueryParam = useRootNavigationState((state) => selectSearchRawQueryParam(state ?? navigation.getState()));
    const searchKeyParam = useRootNavigationState((state) => selectSearchKeyParam(state ?? navigation.getState()));
    const savedSearchKeyParam = useRootNavigationState((state) => selectSavedSearchKeyParam(state ?? navigation.getState()));
    const definedQueryParam = usePreviousDefined(queryParam) ?? buildSearchQueryString();
    const currentSearchQueryJSON = buildSearchQueryJSON(definedQueryParam, rawQueryParam);

    const suggestedSearches = useSuggestedSearches();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;
    // Identity is derived from the query itself: a query belongs to a suggested (or saved) search while it still
    // contains that search's defining filters. This stays correct no matter how the query was edited (chips, the
    // search bar, advanced filters) and releases the identity once a defining filter changes. The route params
    // (searchKey/savedSearchKey) are used as tie-breaking hints, and only while they still match the query.
    const savedSearchQueryFromParam = savedSearchKeyParam ? savedSearches?.[Number(savedSearchKeyParam)]?.query : undefined;
    const suggestedParamMatches = !!searchKeyParam && doesQueryMatchSuggestedSearch(currentSearchQueryJSON, suggestedSearches[searchKeyParam]?.searchQueryJSON);
    const savedParamMatches = !!savedSearchQueryFromParam && doesQueryMatchSuggestedSearch(currentSearchQueryJSON, buildSearchQueryJSON(savedSearchQueryFromParam));

    let currentSearchKey: SearchKey | undefined;
    let currentSavedSearchKey: string | undefined;
    if (suggestedParamMatches) {
        currentSearchKey = searchKeyParam;
    } else if (savedParamMatches) {
        currentSavedSearchKey = savedSearchKeyParam;
    } else {
        currentSearchKey = getSuggestedSearchKeyForQuery(currentSearchQueryJSON, suggestedSearches);
        currentSavedSearchKey = currentSearchKey ? undefined : getSavedSearchKeyForQuery(currentSearchQueryJSON, savedSearches);
    }
    const currentSavedSearchQuery = currentSavedSearchKey ? savedSearches?.[Number(currentSavedSearchKey)]?.query : undefined;

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
        currentSavedSearchKey,
        currentSavedSearchQuery,
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
