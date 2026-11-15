import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';

import {navigateToFlatNavItem, navigateToFlatNavSection} from '@libs/SearchNavigationUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import type {FlatNavItem, FlatNavSection} from './types';

/**
 * Handlers that open a flat nav item or section on the query the user last left it with. Anonymous-user interception
 * and navigation spans stay with the caller.
 */
function useFlatNavNavigation() {
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const {clearSelectedTransactions} = useSearchSelectionActions();

    const navigateToItem = (item: FlatNavItem) => navigateToFlatNavItem(item, searchFilters, clearSelectedTransactions);
    const navigateToSection = (section: FlatNavSection) => navigateToFlatNavSection(section, searchFilters, clearSelectedTransactions);

    return {navigateToItem, navigateToSection};
}

export default useFlatNavNavigation;
