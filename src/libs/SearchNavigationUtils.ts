import ROUTES from '@src/ROUTES';

import type {SearchKey} from './SearchUIUtils';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {buildSearchQueryJSON, getValidLastQuery} from './SearchQueryUtils';

function navigateToCannedSpendSearch(
    searchKey: SearchKey,
    searchQuery: string,
    lastSearchQuery: string | undefined,
    currentSearchHash: number,
    clearSelectedTransactions: () => void,
    setCurrentSearchKey: (key: SearchKey, pending: boolean) => void,
) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    setCurrentSearchKey(searchKey, buildSearchQueryJSON(query)?.hash !== currentSearchHash);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
}

export default navigateToCannedSpendSearch;
