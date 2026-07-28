import ROUTES from '@src/ROUTES';

import {setSearchContext} from './actions/Search';
import Navigation from './Navigation/Navigation';

function navigateToCannedSpendSearch(searchQuery: string, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
}

export default navigateToCannedSpendSearch;
