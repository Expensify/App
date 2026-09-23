import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadSearchCategoryData from '@hooks/useLoadSearchCategoryData';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {buildSearchQueryJSON, buildSearchQueryString, getSearchRootParamsFromRootState} from '@libs/SearchQueryUtils';
import {getSuggestedSearches, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultExpensifyCardSelector} from '@src/selectors/Card';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

import type {SearchQueryActionsValue, SearchQueryContextValue} from './types';

import useSearchKeyParam from './hooks/useSearchKeyParam';
import {SearchQueryActionsContext, SearchQueryContext} from './SearchContextDefinitions';

type SearchQueryProviderProps = {
    children: React.ReactNode;
};

function selectSearchQueryParam(state: NavigationState | undefined) {
    return getSearchRootParamsFromRootState(state)?.q;
}

function selectSearchRawQueryParam(state: NavigationState | undefined) {
    return getSearchRootParamsFromRootState(state)?.rawQuery;
}

function SearchQueryProvider({children}: SearchQueryProviderProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the resolved Search root route to avoid
    // re-renders from new object references returned by getSearchRootParamsFromRootState.
    const queryParam = useRootNavigationState((state) => selectSearchQueryParam(state ?? navigation.getState()));
    const rawQueryParam = useRootNavigationState((state) => selectSearchRawQueryParam(state ?? navigation.getState()));
    const definedQueryParam = usePreviousDefined(queryParam) ?? buildSearchQueryString();
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

    const {currentSearchKey, currentDefaultSearchQueryJSON, getSearchKeyForQuery} = useSearchKeyParam(currentSearchQueryJSON, suggestedSearches);
    const currentDefaultSearchQueryFilterKeys = new Set(currentDefaultSearchQueryJSON?.flatFilters.map((filter) => filter.key));

    const [shouldResetSearchQuery, setShouldResetSearchQuery] = useState(false);

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
