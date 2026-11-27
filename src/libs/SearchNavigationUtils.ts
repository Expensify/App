import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {SearchFilters} from '@src/types/onyx';

import type {NavigationState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';

import {CommonActions, TabActions} from '@react-navigation/native';

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

function getCannedSpendSearchRoute(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined) {
    return ROUTES.SEARCH_ROOT.getRoute({query: getValidLastQuery(lastSearchQuery, searchQuery, searchKey), searchKey});
}

function navigateToCannedSpendSearch(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    Navigation.navigate(getCannedSpendSearchRoute(searchKey, searchQuery, lastSearchQuery));
}

function getSpendTabSearchQuery(searchKey: SpendTabSearchKey) {
    return buildCannedSearchQuery(searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS ? {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} : undefined);
}

/** The route of the Expenses or Reports tab, on the query the user last left it with. */
function getSpendTabRoute(searchKey: SpendTabSearchKey, lastSearchQuery: string | undefined) {
    return getCannedSpendSearchRoute(searchKey, getSpendTabSearchQuery(searchKey), lastSearchQuery);
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
    searchNavigatorState: NavigationState,
    tabNavigatorStateKeyToFocusSearchIn: string | undefined,
) {
    clearSelectedTransactions();
    setSearchContext(false);
    const params = {q: normalizeDatePresetsInQuery(getValidLastQuery(lastSearchQuery, getSpendTabSearchQuery(searchKey), searchKey)), name: undefined, rawQuery: undefined, searchKey};
    if (!tabNavigatorStateKeyToFocusSearchIn) {
        navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params}, target: searchNavigatorState.key});
        return;
    }
    // From another tab the new search replaces the one Search had instead of adding a step to its params history. Such
    // a step would take a Back of its own on Android, which on an unchanged search appears to do nothing. The routes
    // keep their keys, so the page stays mounted.
    navigationRef.dispatch({
        ...CommonActions.reset({
            ...searchNavigatorState,
            routes: searchNavigatorState.routes.map((route, index) => (index === searchNavigatorState.index ? {...route, params: {...route.params, ...params}} : route)),
        }),
        target: searchNavigatorState.key,
    });
    navigationRef.dispatch({...TabActions.jumpTo(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR), target: tabNavigatorStateKeyToFocusSearchIn});
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
    navigateToSearch({query: normalizeDatePresetsInQuery(getValidLastQuery(lastSearchQuery, item.query, item.key)), name: item.name, searchKey: item.key});
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
export {getSpendTabRoute, navigateToFlatNavItem, navigateToFlatNavSection, navigateToSearch, navigateToSpendTab, showSpendTabSearchOnMountedSearchPage};
export type {SpendTabSearchKey};
