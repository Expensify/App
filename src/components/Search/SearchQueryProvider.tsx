import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadSearchCategoryData from '@hooks/useLoadSearchCategoryData';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getSuggestedSearches, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';

import type {SearchQueryActionsValue, SearchQueryContextValue} from './types';

import {SearchQueryActionsContext, SearchQueryContext} from './SearchContextDefinitions';

type SearchQueryProviderProps = {
    children: React.ReactNode;
};

/** Joins `q` and `rawQuery` so they can't drift apart: restoring only `q` would drop `rawFilterList` from the
 *  query JSON while keeping the same hash. */
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

function SearchQueryProvider({children}: SearchQueryProviderProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the focused screen to avoid
    // re-renders from new object references returned by getDeepestFocusedScreen.
    const queryParams = useRootNavigationState((state) => selectSearchQueryParams(state ?? navigation.getState()));
    const {query: queryParam, rawQuery: rawQueryParam} = splitSearchQueryParams(usePreviousDefined(queryParams));
    const definedQueryParam = queryParam ?? buildSearchQueryString();
    const currentSearchQueryJSON = buildSearchQueryJSON(definedQueryParam, rawQueryParam);
    const shouldLoadCategoryData = currentSearchQueryJSON?.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) ?? false;
    useLoadSearchCategoryData({shouldLoad: shouldLoadCategoryData});

    const {defaultCardFeed, activeExpensifyCardFeedID} = useCardFeedsForDisplay();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const defaultCardFeedID = defaultCardFeed?.id;
    // Only policy IDs are needed so Top Spenders matches the type menu hash; card feeds aren't used for that eligibility.
    const topSpendersPolicyIDs = useMemo(() => getSuggestedSearchesVisibility(email, {}, policies, undefined).topSpendersPolicyIDs, [email, policies]);
    const suggestedSearches = getSuggestedSearches(accountID, defaultCardFeedID, undefined, topSpendersPolicyIDs, activeExpensifyCardFeedID);

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
