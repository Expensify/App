import ROUTES from '@src/ROUTES';

import type {SearchKey} from './SearchUIUtils';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {getValidLastQuery} from './SearchQueryUtils';

function navigateToCannedSpendSearch(
    searchKey: SearchKey,
    searchQuery: string,
    lastSearchQuery: string | undefined,
    clearSelectedTransactions: () => void,
    setCurrentSearchKey: (key: SearchKey, pendingQuery?: string) => void,
) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    setCurrentSearchKey(searchKey, query);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
}

export default navigateToCannedSpendSearch;
