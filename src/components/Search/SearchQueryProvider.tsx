import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadSearchCategoryData from '@hooks/useLoadSearchCategoryData';
import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString, doesQueryMatchDefaultFilterKeysAndType} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {GENERIC_SEARCH_KEYS, getLastSearchQuery, getSuggestedSearches, savedSearchIDToSearchKey, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {defaultExpensifyCardSelector} from '@src/selectors/Card';

import type {NavigationState} from '@react-navigation/routers';

import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

import type {SearchQueryActionsValue, SearchQueryContextValue} from './types';

import {SearchQueryActionsContext, SearchQueryContext} from './SearchContextDefinitions';

type SearchQueryProviderProps = {
    children: React.ReactNode;
};

const typeToGenericKey: Record<string, SearchKey> = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: CONST.SEARCH.SEARCH_KEYS.REPORTS,
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
    const [prevCurrentSearchHash, setPrevCurrentSearchHash] = useState(currentSearchHash);

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const [shouldResetSearchQuery, setShouldResetSearchQuery] = useState(false);

    /**
     * Resolves the key only from signals that positively identify the query as a specific search: a suggested
     * search's own default query, or a saved search's exact query. A search's stored last query is deliberately
     * excluded, because `similarSearchHash` compares only the filter *keys* of most filters, so an unrelated
     * stored query collides with the current one (`merchant:Amazon` and `merchant:Zulu` hash identically).
     */
    const getExactSearchKeyForQuery = (queryJSON = currentSearchQueryJSON) => {
        const suggestedSearchKey = Object.values(suggestedSearches).find((search) => search.similarSearchHash === queryJSON?.similarSearchHash)?.key;
        if (suggestedSearchKey) {
            return suggestedSearchKey;
        }

        const savedSearchID = Object.keys(savedSearches ?? {}).find((id) => {
            const savedSearchQuery = savedSearches?.[id].query;
            return savedSearchQuery ? buildSearchQueryJSON(savedSearchQuery)?.hash === queryJSON?.hash : false;
        });

        return savedSearchID ? savedSearchIDToSearchKey(savedSearchID) : undefined;
    };

    const getSearchKeyForQuery = (queryJSON = currentSearchQueryJSON) => {
        const exactSearchKey = getExactSearchKeyForQuery(queryJSON);
        if (exactSearchKey) {
            return exactSearchKey;
        }

        // Only then fall back to the query each search was last used with. Generic keys are skipped here: their
        // defaults constrain nothing, so they already win via the type fallback below, and matching them on a
        // last query would let them shadow the specific search the query actually belongs to.
        const lastQuerySearchKey = Object.values(suggestedSearches).find((search) => {
            if (GENERIC_SEARCH_KEYS.has(search.key)) {
                return false;
            }
            const lastSearchFilterQuery = getLastSearchQuery(searchFilters, search.key);
            const lastSearchFilter = lastSearchFilterQuery ? buildSearchQueryJSON(lastSearchFilterQuery) : undefined;
            return lastSearchFilter?.similarSearchHash === queryJSON?.similarSearchHash;
        })?.key;
        if (lastQuerySearchKey) {
            return lastQuerySearchKey;
        }

        const lastQuerySavedSearchID = Object.keys(savedSearches ?? {}).find((id) => {
            const lastSavedSearchQuery = getLastSearchQuery(searchFilters, savedSearchIDToSearchKey(id));
            return lastSavedSearchQuery ? buildSearchQueryJSON(lastSavedSearchQuery)?.hash === queryJSON?.hash : false;
        });

        if (lastQuerySavedSearchID) {
            return savedSearchIDToSearchKey(lastQuerySavedSearchID);
        }

        return queryJSON?.type ? typeToGenericKey[queryJSON.type] : undefined;
    };

    const [currentSearchKey, setCurrentSearchKey] = useState(getSearchKeyForQuery);
    // Search key can be undefined when the query is not bound to any search key (e.g., query with type of chat).
    // `null` means there is no pending current search key.
    const [pendingCurrentSearchKey, setPendingCurrentSearchKey] = useState<SearchKey | undefined | null>(null);

    const currentDefaultSearchQueryString = currentSearchKey ? suggestedSearches[currentSearchKey]?.searchQuery : undefined;
    const currentDefaultSearchQueryJSON = currentDefaultSearchQueryString ? buildSearchQueryJSON(currentDefaultSearchQueryString) : undefined;
    const currentDefaultSearchQueryFilterKeys = new Set(currentDefaultSearchQueryJSON?.flatFilters.map((filter) => filter.key));

    const resetSearchKey = (queryJSON = currentSearchQueryJSON) => {
        const searchKey = getSearchKeyForQuery(queryJSON);
        if (queryJSON?.hash !== currentSearchHash) {
            setPendingCurrentSearchKey(searchKey);
        } else {
            setCurrentSearchKey(searchKey);
        }
    };

    if (currentSearchHash !== prevCurrentSearchHash) {
        setPrevCurrentSearchHash(currentSearchHash);

        if (pendingCurrentSearchKey !== null) {
            setCurrentSearchKey(pendingCurrentSearchKey);
            setPendingCurrentSearchKey(null);
        }
        // Every time the query changes, we invalidate the currentSearchKey if the new query doesn't have the default filters
        // from the currently selected search key query or the type is different. For example, the "Card statements" suggested
        // search default filters are Feed and Posted. When the query changes (by removing Posted), the search key becomes invalid,
        // it's not a "Card statements" search anymore. This can happen when accessing the page through a link/deeplink.
        else if (!doesQueryMatchDefaultFilterKeysAndType(currentSearchQueryJSON, currentDefaultSearchQueryJSON)) {
            resetSearchKey();
        }
        // The query can satisfy the current key's default filters and still be a different search entirely,
        // because a generic key's default constrains nothing: every expense-report query "matches" Reports.
        // So when the new query *is* another search's default (or a saved search), switch to that more
        // specific key. Only those exact signals may switch the key here — a last-query match is too coarse
        // to distinguish a genuine tab change from the user editing a filter on the current tab.
        else {
            const exactSearchKey = getExactSearchKeyForQuery(currentSearchQueryJSON);
            if (exactSearchKey && exactSearchKey !== currentSearchKey) {
                setCurrentSearchKey(exactSearchKey);
            }
        }
    }

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
        setCurrentSearchKey: (key, pendingQuery) => {
            // We pending the update of the currentSearchKey to be updated later at the same time with the
            // currentSearchQueryJSON so the consumer won't see mismatch value between search key and query JSON.
            const pending = pendingQuery !== undefined && buildSearchQueryJSON(pendingQuery)?.hash !== currentSearchHash;
            if (pending) {
                setPendingCurrentSearchKey(key);
            } else {
                setCurrentSearchKey(key);
            }
        },
        resetSearchKey,
    };

    return (
        <SearchQueryContext value={queryValue}>
            <SearchQueryActionsContext value={queryActionsValue}>{children}</SearchQueryActionsContext>
        </SearchQueryContext>
    );
}

export default SearchQueryProvider;
