import type {SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';

import Navigation, {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {getSearchKeyForDataType, isExistingSearchKey, savedSearchIDToSearchKey, searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON, doesQueryMatchDefaultFilterKeysAndType} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {NavigationState} from '@react-navigation/native';

import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';

// `usePreviousDefined` keeps the last non-nullish value, so the focused-but-keyless case needs a value of its
// own that isn't `undefined`. An empty string is never a valid search key, so `isExistingSearchKey` rejects it.
const NO_SEARCH_KEY = '';

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

/**
 * Owns the search key of the current search: resolves it from the `searchKey` route param (or from the query
 * itself when the param can't be trusted), and writes the resolved key back onto the focused search screen.
 */
function useSearchKeyParam(currentSearchQueryJSON: SearchQueryJSON | undefined, suggestedSearches: Record<SearchKey, SearchTypeMenuItem>) {
    const navigation = useNavigation();
    const searchKeyParam = useRootNavigationState((state) => selectSearchKeyParam(state ?? navigation.getState()));
    const definedSearchKeyParam = usePreviousDefined(searchKeyParam);
    const isSearchScreenFocused = searchKeyParam !== undefined;

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const suggestedSearchKeys = ObjectUtils.typedKeys(suggestedSearches);
    const savedSearchIDs = Object.keys(savedSearches ?? {});

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
        if (!searchKey) {
            return undefined;
        }

        const savedSearchID = searchKeyToSavedSearchID(searchKey);
        const defaultSearchQueryString = savedSearchID ? savedSearches?.[savedSearchID]?.query : suggestedSearches[searchKey]?.searchQuery;
        return defaultSearchQueryString ? buildSearchQueryJSON(defaultSearchQueryString) : undefined;
    };

    // The `searchKey` param is sticky: it survives a `Navigation.setParams({q})`, so tweaking a filter keeps the
    // search key. That also means it can outlive the search it names, so it's validated against the query here.
    // For example, the "Card statements" suggested search default filters are Feed and Posted. Once the query drops
    // Posted, it's not a "Card statements" search anymore and the key is ignored in favor of one derived from the
    // query. The same guard covers a stale or hand-written key arriving through a shared link/deeplink.
    const searchKeyFromParam = isExistingSearchKey(definedSearchKeyParam, suggestedSearchKeys, savedSearchIDs) ? definedSearchKeyParam : undefined;
    const paramDefaultSearchQueryJSON = getDefaultSearchQueryJSON(searchKeyFromParam);
    // A saved search is exempt from that validation, because it's the user's own query and they're free to change
    // it however they like without it becoming a different search.
    const isSearchKeyFromParamValid =
        !!searchKeyFromParam && (!!searchKeyToSavedSearchID(searchKeyFromParam) || doesQueryMatchDefaultFilterKeysAndType(currentSearchQueryJSON, paramDefaultSearchQueryJSON));

    const currentSearchKey = isSearchKeyFromParamValid ? searchKeyFromParam : getSearchKeyForQuery(currentSearchQueryJSON);
    const currentDefaultSearchQueryJSON = isSearchKeyFromParamValid ? paramDefaultSearchQueryJSON : getDefaultSearchQueryJSON(currentSearchKey);

    useEffect(() => {
        if (!isSearchScreenFocused || isSearchKeyFromParamValid) {
            return;
        }
        Navigation.setParams({searchKey: currentSearchKey});
    }, [isSearchScreenFocused, isSearchKeyFromParamValid, currentSearchKey]);

    return {currentSearchKey, currentDefaultSearchQueryJSON, getSearchKeyForQuery};
}

export default useSearchKeyParam;
