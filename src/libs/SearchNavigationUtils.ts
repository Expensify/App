import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

function navigateToCannedSpendSearch(searchQuery: string, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
}

export {navigateToCannedSpendSearch};
