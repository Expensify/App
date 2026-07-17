import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {setCurrentSearchKey} from '@libs/actions/Search';
import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getSuggestedSearches, savedSearchIDToSearchKey} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

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

    const {defaultCardFeed} = useCardFeedsForDisplay();
    const {accountID} = useCurrentUserPersonalDetails();
    const defaultCardFeedID = defaultCardFeed?.id;
    const suggestedSearches = getSuggestedSearches(accountID, defaultCardFeedID);

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [currentSearchKeyOnyx] = useOnyx(ONYXKEYS.RAM_ONLY_CURRENT_SEARCH_KEY);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const [shouldResetSearchQuery, setShouldResetSearchQuery] = useState(false);

    const currentSearchKey = (() => {
        if (currentSearchKeyOnyx) {
            return currentSearchKeyOnyx;
        }

        const suggestedSearchKey = Object.values(suggestedSearches).find((search) => {
            const savedSearchFilterQuery = searchFilters?.[search.key];
            const savedSearchFilter = savedSearchFilterQuery ? buildSearchQueryJSON(savedSearchFilterQuery) : undefined;
            return (savedSearchFilter ?? search).similarSearchHash === currentSimilarSearchHash;
        })?.key;
        if (suggestedSearchKey) {
            return suggestedSearchKey;
        }

        const savedSearchID = Object.keys(savedSearches ?? {}).find((id) => {
            const query = searchFilters?.[savedSearchIDToSearchKey(id)] ?? savedSearches?.[id].query;
            return query ? buildSearchQueryJSON(query)?.similarSearchHash === currentSimilarSearchHash : false;
        });

        if (savedSearchID) {
            return savedSearchIDToSearchKey(savedSearchID);
        }

        const typeToGenericKey: Record<string, SearchKey> = {
            [CONST.SEARCH.DATA_TYPES.EXPENSE]: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: CONST.SEARCH.SEARCH_KEYS.REPORTS,
        };
        return currentSearchQueryJSON?.type ? typeToGenericKey[currentSearchQueryJSON.type] : undefined;
    })();

    const currentQueryFilterKeys = new Set(currentSearchQueryJSON?.flatFilters.map((filter) => filter.key));
    const currentSearchKeyDefaultFilterKeys = new Set(currentSearchKeyOnyx ? suggestedSearches[currentSearchKeyOnyx]?.searchQueryJSON?.flatFilters.map((filter) => filter.key) : undefined);

    useEffect(() => {
        // Every time the query changes, we invalidate the currentSearchKey if the new query doesn't have the default filters
        // from the currently selected search key query. For example, the "Card statements" suggested search default filters
        // are Feed and Posted. When the query changes (by removing Posted), the search key becomes invalid, it's not a
        // "Card statements" search anymore. This can happen when accessing the page through a link/deeplink.
        if (currentQueryFilterKeys.isSupersetOf(currentSearchKeyDefaultFilterKeys)) {
            return;
        }
        setCurrentSearchKey(null);
    }, [currentSearchHash]);

    useEffect(() => {
        // currentSearchKeyOnyx is a RAM-only Onyx data, so the initial value will always be empty and need to be hydrated.
        if (currentSearchKeyOnyx) {
            return;
        }
        setCurrentSearchKey(currentSearchKey ?? null);
    }, [currentSearchKey]);

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
