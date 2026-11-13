/**
 * The presses of the Expenses, Reports and More items of the flat nav native bar. Expenses and Reports open Search on
 * the query the user last left that search with, and More opens the More menu. The router never focuses these
 * placeholders, see tabRouterOverride, so their own navigation does nothing and the press is the whole tap.
 */
import MoreMenuPopover from '@components/Navigation/MoreMenu/MoreMenuPopover';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import openSearchFromTabBar from '@libs/Navigation/FlatNavTabBar/openSearchFromTabBar';
import {navigateToSpendTab} from '@libs/SearchNavigationUtils';
import type {SpendTabSearchKey} from '@libs/SearchNavigationUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {lastExpensesSearchQuerySelector, lastReportsSearchQuerySelector} from '@src/selectors/SearchFilters';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useEffect, useState} from 'react';

import type {NativeTabLayoutProps} from './NativeTabLayout';

import {getSearchTabSearchKey} from './nativeTabItemUtils';

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

    // Focus and the current search are read at the press, not from the last render, so a quick second tap sees the
    // navigation the first one made.
    const openSpendTab = (searchKey: SpendTabSearchKey) => {
        const isSearchFocused = !!searchNavigation?.isFocused();
        const currentSearchKey = getSearchTabSearchKey(searchNavigation?.getState().routes.find((tabRoute) => tabRoute.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
        // Search already on this search: the tap is a repeated selection, which the native bar answers by itself.
        if (isSearchFocused && currentSearchKey === searchKey) {
            return;
        }
        clearSelectedText();
        const lastSearchQuery = searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS ? lastReportsSearchQuery : lastExpensesSearchQuery;
        openSearchFromTabBar(() => navigateToSpendTab(searchKey, lastSearchQuery, clearSelectedTransactions), isSearchFocused, session);
    };

    const openMoreMenu = () => {
        interceptAnonymousUser(() => setMoreMenuState('open'), session);
    };

    useEffect(() => {
        const removeListeners = [
            expensesNavigation?.addListener('tabPress', () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.EXPENSES)),
            reportsNavigation?.addListener('tabPress', () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.REPORTS)),
            moreNavigation?.addListener('tabPress', openMoreMenu),
        ];
        return () => {
            for (const removeListener of removeListeners) {
                removeListener?.();
            }
        };
    }, [expensesNavigation, reportsNavigation, moreNavigation, openSpendTab, openMoreMenu]);

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
