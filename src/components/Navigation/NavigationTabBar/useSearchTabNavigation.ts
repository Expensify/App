import useOnyx from '@hooks/useOnyx';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import navigationRef from '@navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import getSearchTabRoute from './getSearchTabRoute';

/** Returns the handler that opens the Spend tab on the search the user last had open there. */
function useSearchTabNavigation(isSearchSelected: boolean) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    return () => {
        if (isSearchSelected) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            startNavigateToReportsTabSpans();

            Navigation.navigate(getSearchTabRoute(navigationRef.getRootState(), lastSearchParams, lastExpensesSearchQuery));
        }, session);
    };
}

export default useSearchTabNavigation;
