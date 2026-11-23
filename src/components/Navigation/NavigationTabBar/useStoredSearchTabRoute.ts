import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {OnyxEntry} from 'react-native-onyx';

import {getStoredSearchTabParams} from './getSearchTabRoute';

function lastSearchQuerySelector(lastSearchParams: OnyxEntry<LastSearchParams>): LastSearchParams {
    return {queryJSON: lastSearchParams?.queryJSON, searchKey: lastSearchParams?.searchKey};
}

/** Returns the Spend route a new browser tab opens. A new tab has no navigation history, so it starts from the last search kept in Onyx. */
function useStoredSearchTabRoute() {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: lastSearchQuerySelector});
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    return ROUTES.SEARCH_ROOT.getRoute(getStoredSearchTabParams(lastSearchParams, lastExpensesSearchQuery));
}

export default useStoredSearchTabRoute;
