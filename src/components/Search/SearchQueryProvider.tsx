import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {getSuggestedSearches, savedSearchIDToSearchKey, searchKeyToSavedSearchID, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

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
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const defaultCardFeedID = defaultCardFeed?.id;
    // Only policy IDs are needed so Top Spenders matches the type menu hash; card feeds aren't used for that eligibility.
    const topSpendersPolicyIDs = useMemo(() => getSuggestedSearchesVisibility(email, {}, policies, undefined).topSpendersPolicyIDs, [email, policies]);
    const suggestedSearches = getSuggestedSearches(accountID, defaultCardFeedID, undefined, topSpendersPolicyIDs);

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;
    const [prevCurrentSearchHash, setPrevCurrentSearchHash] = useState(currentSearchHash);

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const [shouldResetSearchQuery, setShouldResetSearchQuery] = useState(false);

    const getInitialCurrentSearchKey = (queryJSON = currentSearchQueryJSON) => {
        const suggestedSearchKey = Object.values(suggestedSearches).find((search) => {
            const lastSearchFilterQuery = searchFilters?.[search.key];
            const lastSearchFilter = lastSearchFilterQuery ? buildSearchQueryJSON(lastSearchFilterQuery) : undefined;
            return search.similarSearchHash === queryJSON?.similarSearchHash || lastSearchFilter?.similarSearchHash === queryJSON?.similarSearchHash;
        })?.key;
        if (suggestedSearchKey) {
            return suggestedSearchKey;
        }

        const savedSearchID = Object.keys(savedSearches ?? {}).find((id) => {
            const savedSearchQuery = savedSearches?.[id].query;
            const lastSavedSearchQuery = searchFilters?.[savedSearchIDToSearchKey(id)];

            return (
                (savedSearchQuery ? buildSearchQueryJSON(savedSearchQuery)?.similarSearchHash === queryJSON?.similarSearchHash : false) ||
                (lastSavedSearchQuery ? buildSearchQueryJSON(lastSavedSearchQuery)?.similarSearchHash === queryJSON?.similarSearchHash : false)
            );
        });

        if (savedSearchID) {
            return savedSearchIDToSearchKey(savedSearchID);
        }

        const typeToGenericKey: Record<string, SearchKey> = {
            [CONST.SEARCH.DATA_TYPES.EXPENSE]: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: CONST.SEARCH.SEARCH_KEYS.REPORTS,
        };
        return queryJSON?.type ? typeToGenericKey[queryJSON.type] : undefined;
    };

    const [currentSearchKey, setCurrentSearchKey] = useState(getInitialCurrentSearchKey);

    const currentQueryFilterKeys = new Set(currentSearchQueryJSON?.flatFilters.map((filter) => filter.key));
    const currentDefaultSearchQueryString = currentSearchKey
        ? (suggestedSearches[currentSearchKey]?.searchQuery ?? savedSearches?.[searchKeyToSavedSearchID(currentSearchKey) ?? '']?.query)
        : undefined;
    const currentDefaultSearchQueryJSON = currentDefaultSearchQueryString ? buildSearchQueryJSON(currentDefaultSearchQueryString) : undefined;
    const currentDefaultSearchHash = currentDefaultSearchQueryJSON?.hash;
    const currentDefaultSearchQueryFilterKeys = new Set(currentDefaultSearchQueryJSON?.flatFilters.map((filter) => filter.key));

    const resetSearchKey = (queryJSON = currentSearchQueryJSON) => {
        setCurrentSearchKey(getInitialCurrentSearchKey(queryJSON));
    };

    if (currentSearchHash !== prevCurrentSearchHash) {
        setPrevCurrentSearchHash(currentSearchHash);

        // Every time the query changes, we invalidate the currentSearchKey if the new query doesn't have the default filters
        // from the currently selected search key query or the type is different. For example, the "Card statements" suggested
        // search default filters are Feed and Posted. When the query changes (by removing Posted), the search key becomes invalid,
        // it's not a "Card statements" search anymore. This can happen when accessing the page through a link/deeplink.
        if ([...currentDefaultSearchQueryFilterKeys].every((value) => currentQueryFilterKeys.has(value)) && currentSearchQueryJSON?.type === currentDefaultSearchQueryJSON?.type) {
            return;
        }
        resetSearchKey();
    }

    const queryValue: SearchQueryContextValue = {
        currentSearchHash,
        currentSimilarSearchHash,
        currentSearchKey,
        currentSearchQueryJSON,
        currentDefaultSearchHash,
        currentDefaultSearchQueryString,
        currentDefaultSearchQueryFilterKeys,
        suggestedSearches,
        shouldResetSearchQuery,
    };

    const queryActionsValue: SearchQueryActionsValue = {
        setShouldResetSearchQuery,
        setCurrentSearchKey,
        resetSearchKey,
    };

    return (
        <SearchQueryContext value={queryValue}>
            <SearchQueryActionsContext value={queryActionsValue}>{children}</SearchQueryActionsContext>
        </SearchQueryContext>
    );
}

export default SearchQueryProvider;
