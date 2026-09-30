import ROUTES from '@src/ROUTES';

import type {SearchKey} from './SearchKeyUtils';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {getValidLastQuery} from './SearchQueryUtils';

function navigateToCannedSpendSearch(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey}));
}

export default navigateToCannedSpendSearch;
