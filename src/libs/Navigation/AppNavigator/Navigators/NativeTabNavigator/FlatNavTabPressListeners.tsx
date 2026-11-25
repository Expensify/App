/**
 * The presses of the Expenses, Reports and More items of the flat nav native bar. Expenses and Reports open Search on
 * the query the user last left that search with, and More opens the More menu. The router never focuses these
 * placeholders, see tabRouterOverride, so their own navigation does nothing and the press is the whole tap.
 */
import MoreMenuPopover from '@components/Navigation/MoreMenu/MoreMenuPopover';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import openSearchFromTabBar from '@libs/Navigation/FlatNavTabBar/openSearchFromTabBar';
import {navigateToSpendTab, showSpendTabSearchOnMountedSearchPage} from '@libs/SearchNavigationUtils';
import type {SpendTabSearchKey} from '@libs/SearchNavigationUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {lastExpensesSearchQuerySelector, lastReportsSearchQuerySelector} from '@src/selectors/SearchFilters';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useEffect, useRef, useState} from 'react';

import type {NativeTabLayoutProps} from './NativeTabLayout';

import {findSearchTabRoute, getSearchTabSearchKey} from './nativeTabItemUtils';

type MoreMenuState = 'closed' | 'open' | 'closing';

function FlatNavTabPressListeners({state, descriptors}: Pick<NativeTabLayoutProps, 'state' | 'descriptors'>) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});
    const [lastReportsSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastReportsSearchQuerySelector});
    const {clearSelectedTransactions} = useSearchSelectionActions();
    // The menu is mounted only while it is open or closing, so its data is not read the rest of the time.
    const [moreMenuState, setMoreMenuState] = useState<MoreMenuState>('closed');
    const getTabNavigation = (routeName: string) => descriptors[state.routes.find((tabRoute) => tabRoute.name === routeName)?.key ?? '']?.navigation;
    const searchNavigation = getTabNavigation(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const expensesNavigation = getTabNavigation(SCREENS.NATIVE_TAB_ITEM.EXPENSES);
    const reportsNavigation = getTabNavigation(SCREENS.NATIVE_TAB_ITEM.REPORTS);
    const moreNavigation = getTabNavigation(SCREENS.NATIVE_TAB_ITEM.MORE);

    // A navigation through the search route hands Search its search in the tab route params, which Search takes only in its
    // next render. A tap made before then would navigate Search directly and be overridden by those params, so it waits.
    const pendingSearchNavigation = useRef<{isPending: boolean; queuedSearchKey?: SpendTabSearchKey}>({isPending: false});
    const getCurrentSearchTabRoute = () => findSearchTabRoute(searchNavigation?.getState());

    // Focus and the current search are read at the press, not from the last render, so a quick second tap sees the
    // navigation the first one made.
    const openSpendTab = (searchKey: SpendTabSearchKey) => {
        const isSearchFocused = !!searchNavigation?.isFocused();
        // A press made after leaving the pending Search for another tab is not queued, since the queue is replayed only
        // for a user still on Search. It navigates from that tab like any other press.
        if (pendingSearchNavigation.current.isPending && isSearchFocused) {
            pendingSearchNavigation.current.queuedSearchKey = searchKey;
            return;
        }
        const searchTabRoute = getCurrentSearchTabRoute();
        // Search already on this search: the tap is a repeated selection, which the native bar answers by itself.
        if (isSearchFocused && getSearchTabSearchKey(searchTabRoute) === searchKey) {
            return;
        }
        const lastSearchQuery = searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS ? lastReportsSearchQuery : lastExpensesSearchQuery;
        // With the Search page on top of the Search tab the tap only changes its search, as its type tabs do. A tab not
        // mounted yet, or one with another screen on top, is opened through the search route.
        const searchNavigatorState = searchTabRoute?.state;
        const isSearchPageOnTop = searchNavigatorState?.routes.at(searchNavigatorState.index ?? -1)?.name === SCREENS.SEARCH.ROOT;
        const mountedSearchNavigatorState = isSearchPageOnTop && searchNavigatorState?.stale === false ? searchNavigatorState : undefined;
        openSearchFromTabBar(
            () =>
                mountedSearchNavigatorState
                    ? showSpendTabSearchOnMountedSearchPage(searchKey, lastSearchQuery, clearSelectedTransactions, mountedSearchNavigatorState, isSearchFocused ? undefined : state.key)
                    : navigateToSpendTab(searchKey, lastSearchQuery, clearSelectedTransactions),
            isSearchFocused,
            session,
        );
        // Only a navigation through the search route replaces the Search tab route params, so only that one leaves Search pending.
        pendingSearchNavigation.current = {isPending: getCurrentSearchTabRoute()?.params !== searchTabRoute?.params};
    };

    // The tab navigator reports its new state after Search has taken the params.
    useEffect(
        () =>
            searchNavigation?.addListener('state', () => {
                const {isPending, queuedSearchKey} = pendingSearchNavigation.current;
                if (!isPending) {
                    return;
                }
                pendingSearchNavigation.current = {isPending: false};
                // A user who left Search for another tab in the meantime is not pulled back to it.
                if (queuedSearchKey && searchNavigation.isFocused()) {
                    openSpendTab(queuedSearchKey);
                }
            }),
        [searchNavigation, openSpendTab],
    );

    useEffect(() => {
        const removeListeners = [
            expensesNavigation?.addListener('tabPress', () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.EXPENSES)),
            reportsNavigation?.addListener('tabPress', () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.REPORTS)),
            moreNavigation?.addListener('tabPress', () => interceptAnonymousUser(() => setMoreMenuState('open'), session)),
        ];
        return () => {
            for (const removeListener of removeListeners) {
                removeListener?.();
            }
        };
    }, [expensesNavigation, reportsNavigation, moreNavigation, openSpendTab, session]);

    if (moreMenuState === 'closed') {
        return null;
    }

    return (
        <MoreMenuPopover
            isVisible={moreMenuState === 'open'}
            onClose={() => setMoreMenuState('closing')}
            // The hide callback can come from an earlier render, so it reads the current state: a menu opened again
            // while it was closing stays mounted.
            onModalHide={() => setMoreMenuState((previousState) => (previousState === 'closing' ? 'closed' : previousState))}
            focusedTabRouteName={state.routes.at(state.index)?.name}
        />
    );
}

export default FlatNavTabPressListeners;
