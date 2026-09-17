import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadSearchCategoryData from '@hooks/useLoadSearchCategoryData';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import Navigation, {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString, doesQueryMatchDefaultFilterKeysAndType} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {getLastSearchQuery, getSearchKeyForDataType, getSuggestedSearches, isExistingSearchKey, savedSearchIDToSearchKey, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {defaultExpensifyCardSelector} from '@src/selectors/Card';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useEffectEvent, useState} from 'react';

import type {SearchQueryActionsValue, SearchQueryContextValue, SearchQueryJSON} from './types';

import {SearchQueryActionsContext, SearchQueryContext} from './SearchContextDefinitions';

type SearchQueryProviderProps = {
    children: React.ReactNode;
};

// `usePreviousDefined` keeps the last non-nullish value, so the focused-but-keyless case needs a value of its
// own that isn't `undefined`. An empty string is never a valid search key, so `isExistingSearchKey` rejects it.
const NO_SEARCH_KEY = '';

/** Joins `q` and `rawQuery` so they can't drift apart. Restoring only `q` would drop `rawFilterList` from the query
 * JSON while keeping the same hash. */
function selectSearchQueryParams(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    if (focused?.name !== SCREENS.SEARCH.ROOT) {
        return undefined;
    }
    const query = focused.params?.q;
    if (typeof query !== 'string') {
        return undefined;
    }
    const rawQuery = focused.params?.rawQuery;
    return `${query}${CONST.SEARCH.QUERY_PARAMS_SEPARATOR}${typeof rawQuery === 'string' ? rawQuery : ''}`;
}

function splitSearchQueryParams(queryParams: string | undefined) {
    if (queryParams === undefined) {
        return {query: undefined, rawQuery: undefined};
    }
    const separatorIndex = queryParams.indexOf(CONST.SEARCH.QUERY_PARAMS_SEPARATOR);
    if (separatorIndex === -1) {
        return {query: queryParams, rawQuery: undefined};
    }
    const rawQuery = queryParams.slice(separatorIndex + CONST.SEARCH.QUERY_PARAMS_SEPARATOR.length);
    return {query: queryParams.slice(0, separatorIndex), rawQuery: rawQuery || undefined};
}

/**
 * The `searchKey` route param of the focused search screen, or `NO_SEARCH_KEY` when the screen is focused
 * without one (a query that isn't bound to any search key, e.g. a chat type query).
 *
 * Returning `undefined` only when the search screen isn't focused is what lets `usePreviousDefined` keep the
 * last value while something else is focused on top of it (e.g. an RHP), the same way `q` is kept. A plain
 * `usePreviousDefined` can't do that on its own here, because for this param "absent" is a meaningful value.
 */
function selectSearchKeyParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    if (focused?.name !== SCREENS.SEARCH.ROOT) {
        return undefined;
    }
    const searchKey = focused.params?.searchKey;
    return typeof searchKey === 'string' ? searchKey : NO_SEARCH_KEY;
}

function SearchQueryProvider({children}: SearchQueryProviderProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the focused screen to avoid
    // re-renders from new object references returned by getDeepestFocusedScreen.
    const queryParams = useRootNavigationState((state) => selectSearchQueryParams(state ?? navigation.getState()));
    const searchKeyParam = useRootNavigationState((state) => selectSearchKeyParam(state ?? navigation.getState()));
    const {query: queryParam, rawQuery: rawQueryParam} = splitSearchQueryParams(usePreviousDefined(queryParams));
    const definedQueryParam = queryParam ?? buildSearchQueryString();
    const definedSearchKeyParam = usePreviousDefined(searchKeyParam);
    const currentSearchQueryJSON = buildSearchQueryJSON(definedQueryParam, rawQueryParam);
    const shouldLoadCategoryData = currentSearchQueryJSON?.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) ?? false;
    useLoadSearchCategoryData({shouldLoad: shouldLoadCategoryData});

    const {defaultCardFeed, activeExpensifyCardFeedID} = useCardFeedsForDisplay();
    const [defaultExpensifyCardID] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: (card) => defaultExpensifyCardSelector(card)?.id});
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const defaultCardFeedID = defaultCardFeed?.id;
    const {shouldShowExpensifyCard} = getSuggestedSearchesVisibility(email, {}, policies, undefined);
    const suggestedSearches = getSuggestedSearches(accountID, defaultCardFeedID ?? defaultExpensifyCardID, shouldShowExpensifyCard, activeExpensifyCardFeedID);

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const suggestedSearchKeys = ObjectUtils.typedKeys(suggestedSearches);
    const savedSearchIDs = Object.keys(savedSearches ?? {});

    const [shouldResetSearchQuery, setShouldResetSearchQuery] = useState(false);

    const getSearchKeyForQuery = (queryJSON: SearchQueryJSON | undefined) => {
        const suggestedSearchKey = suggestedSearchKeys.find((searchKey) => {
            const lastSearchFilterQuery = getLastSearchQuery(searchFilters, searchKey);
            const lastSearchFilter = lastSearchFilterQuery ? buildSearchQueryJSON(lastSearchFilterQuery) : undefined;
            return suggestedSearches[searchKey]?.similarSearchHash === queryJSON?.similarSearchHash || lastSearchFilter?.similarSearchHash === queryJSON?.similarSearchHash;
        });
        if (suggestedSearchKey) {
            return suggestedSearchKey;
        }

        const savedSearchID = savedSearchIDs.find((id) => {
            const savedSearchQuery = savedSearches?.[id].query;
            const lastSavedSearchQuery = getLastSearchQuery(searchFilters, savedSearchIDToSearchKey(id));

            return (
                (savedSearchQuery ? buildSearchQueryJSON(savedSearchQuery)?.hash === queryJSON?.hash : false) ||
                (lastSavedSearchQuery ? buildSearchQueryJSON(lastSavedSearchQuery)?.hash === queryJSON?.hash : false)
            );
        });

        if (savedSearchID) {
            return savedSearchIDToSearchKey(savedSearchID);
        }

        return getSearchKeyForDataType(queryJSON?.type);
    };

    const getDefaultSearchQueryJSON = (searchKey: SearchKey | undefined) => {
        const defaultSearchQueryString = searchKey ? suggestedSearches[searchKey]?.searchQuery : undefined;
        return defaultSearchQueryString ? buildSearchQueryJSON(defaultSearchQueryString) : undefined;
    };

    // The `searchKey` param is sticky: it survives a `Navigation.setParams({q})`, so tweaking a filter keeps the
    // search key. That also means it can outlive the search it names, so it's validated against the query here.
    // For example, the "Card statements" suggested search default filters are Feed and Posted. Once the query drops
    // Posted, it's not a "Card statements" search anymore and the key is ignored in favour of one derived from the
    // query. The same guard covers a stale or hand-written key arriving through a shared link/deeplink.
    const searchKeyFromParam = isExistingSearchKey(definedSearchKeyParam, suggestedSearchKeys, savedSearchIDs) ? definedSearchKeyParam : undefined;
    const paramDefaultSearchQueryJSON = getDefaultSearchQueryJSON(searchKeyFromParam);
    const isSearchKeyFromParamValid = !!searchKeyFromParam && doesQueryMatchDefaultFilterKeysAndType(currentSearchQueryJSON, paramDefaultSearchQueryJSON);

    const currentSearchKey = isSearchKeyFromParamValid ? searchKeyFromParam : getSearchKeyForQuery(currentSearchQueryJSON);
    const currentDefaultSearchQueryJSON = isSearchKeyFromParamValid ? paramDefaultSearchQueryJSON : getDefaultSearchQueryJSON(currentSearchKey);
    const currentDefaultSearchQueryFilterKeys = new Set(currentDefaultSearchQueryJSON?.flatFilters.map((filter) => filter.key));

    const updateSearchKey = useEffectEvent(() => {
        Navigation.setParams({searchKey: currentSearchKey});
    });

    useEffect(() => {
        if (searchKeyParam === undefined || isSearchKeyFromParamValid) {
            return;
        }
        updateSearchKey();
    }, [isSearchKeyFromParamValid, searchKeyParam]);

    const queryValue: SearchQueryContextValue = {
        currentSearchHash,
        currentSimilarSearchHash,
        currentSearchKey,
        currentSearchQueryJSON,
        currentDefaultSearchQueryJSON,
        currentDefaultSearchQueryFilterKeys,
        suggestedSearches,
        shouldResetSearchQuery,
    };

    const queryActionsValue: SearchQueryActionsValue = {
        setShouldResetSearchQuery,
        getSearchKeyForQuery,
    };

    return (
        <SearchQueryContext value={queryValue}>
            <SearchQueryActionsContext value={queryActionsValue}>{children}</SearchQueryActionsContext>
        </SearchQueryContext>
    );
}

export default SearchQueryProvider;
