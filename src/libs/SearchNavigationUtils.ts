import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {SearchFilters} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {TabActions} from '@react-navigation/native';

import type {FlatNavItem, FlatNavSection} from './Navigation/FlatNav/types';
import type {SearchKey} from './SearchKeyUtils';

import {setSearchContext} from './actions/Search';
import FLAT_NAV from './Navigation/FlatNav/FLAT_NAV';
import {getFlatNavSectionDefaultItem} from './Navigation/FlatNav/FlatNavUtils';
import Navigation from './Navigation/Navigation';
import navigationRef from './Navigation/navigationRef';
import {buildCannedSearchQuery, getValidLastQuery, normalizeDatePresetsInQuery} from './SearchQueryUtils';
import {getLastSearchQuery} from './SearchUIUtils';

/** The Spend searches that have a tab of their own on narrow layouts. Every user has both. */
type SpendTabSearchKey = typeof CONST.SEARCH.SEARCH_KEYS.EXPENSES | typeof CONST.SEARCH.SEARCH_KEYS.REPORTS;

function navigateToCannedSpendSearch(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey}));
}

function getSpendTabSearchQuery(searchKey: SpendTabSearchKey) {
    return buildCannedSearchQuery(searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS ? {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} : undefined);
}

/** Opens the Expenses or Reports tab on the query the user last left it with. */
function navigateToSpendTab(searchKey: SpendTabSearchKey, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    navigateToCannedSpendSearch(searchKey, getSpendTabSearchQuery(searchKey), lastSearchQuery, clearSelectedTransactions);
}

/**
 * Shows the Expenses or Reports search on the Search page that is already mounted, the way its type tabs do: the page
 * takes the new query as params, so it stays mounted and only its list is replaced. Opening the route instead would
 * push a second Search page and mount it from scratch. From another tab, the Search tab is then focused as it is.
 */
function showSpendTabSearchOnMountedSearchPage(
    searchKey: SpendTabSearchKey,
    lastSearchQuery: string | undefined,
    clearSelectedTransactions: () => void,
    searchNavigatorStateKey: string,
    tabNavigatorStateKeyToFocusSearchIn: string | undefined,
) {
    clearSelectedTransactions();
    setSearchContext(false);
    navigationRef.dispatch({
        type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
        payload: {params: {q: getValidLastQuery(lastSearchQuery, getSpendTabSearchQuery(searchKey)), name: undefined, rawQuery: undefined, searchKey}},
        target: searchNavigatorStateKey,
    });
    if (tabNavigatorStateKeyToFocusSearchIn) {
        navigationRef.dispatch({...TabActions.jumpTo(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR), target: tabNavigatorStateKeyToFocusSearchIn});
    }
}

/** Opens a search as it was last seen, such as a saved search. */
function navigateToSearch({query, searchKey, name}: {query: string; searchKey?: SearchKey; name?: string}) {
    setSearchContext(false);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name, searchKey}));
}

/** Opens a flat nav item on the query the user last left it with. */
function navigateToFlatNavItem(item: FlatNavItem, searchFilters: OnyxEntry<SearchFilters>, clearSelectedTransactions: () => void) {
    const lastSearchQuery = getLastSearchQuery(searchFilters, item.key);

    if (item.type === FLAT_NAV.ITEM_TYPE.CANNED_SEARCH) {
        navigateToCannedSpendSearch(item.key, item.searchQuery, lastSearchQuery, clearSelectedTransactions);
        return;
    }

    clearSelectedTransactions();
    navigateToSearch({query: normalizeDatePresetsInQuery(getValidLastQuery(lastSearchQuery, item.query)), name: item.name, searchKey: item.key});
}

/** Opens the item a section lands on. Does nothing when the section has no item that can be opened. */
function navigateToFlatNavSection(section: FlatNavSection, searchFilters: OnyxEntry<SearchFilters>, clearSelectedTransactions: () => void) {
    const defaultItem = getFlatNavSectionDefaultItem(section);
    if (!defaultItem) {
        return;
    }
    navigateToFlatNavItem(defaultItem, searchFilters, clearSelectedTransactions);
}

export default navigateToCannedSpendSearch;
export {navigateToFlatNavItem, navigateToFlatNavSection, navigateToSearch, navigateToSpendTab, showSpendTabSearchOnMountedSearchPage};
export type {SpendTabSearchKey};
