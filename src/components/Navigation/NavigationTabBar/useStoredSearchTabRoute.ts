import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import {getStoredSearchTabParams} from './getSearchTabRoute';

/** Returns the Spend route a new browser tab opens. A new tab has no navigation history, so it starts from the last search kept in Onyx. */
function useStoredSearchTabRoute() {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    return ROUTES.SEARCH_ROOT.getRoute(getStoredSearchTabParams(lastSearchParams, lastExpensesSearchQuery));
}

export default useStoredSearchTabRoute;
