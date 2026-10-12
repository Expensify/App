import {getStoredSearchTabParams} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import getStringParam from '@components/Navigation/NavigationTabBar/getStringParam';
import useOpenMoreTab from '@components/Navigation/NavigationTabBar/useOpenMoreTab';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import useOnyx from '@hooks/useOnyx';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import navigationRef from '@libs/Navigation/navigationRef';
import {navigateToSpendTab} from '@libs/SearchNavigationUtils';
import type {SpendTabSearchKey} from '@libs/SearchNavigationUtils';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {lastExpensesSearchQuerySelector, lastReportsSearchQuerySelector} from '@src/selectors/SearchFilters';

import {CommonActions} from '@react-navigation/native';
import {useEffect} from 'react';

import type {NativeTabLayoutProps} from './NativeTabLayout';

import getNativeTabBarItems from './getNativeTabBarItems';
import {NATIVE_TAB_ITEM_KINDS} from './NATIVE_TAB_GLYPHS';

/**
 * The native bar's handling that needs Onyx data, so the data re-renders only this component.
 * Spend's first visit opens the latest search kept in Onyx, so the tab mounted at startup with the default search gets
 * it before it is first shown, both for the native bar and for the side bar of a wide layout. The Expenses, Reports and
 * More items are switched here rather than by the bar, since the routes behind them take turns filling those slots.
 */
function TabPressListeners({state, descriptors}: Pick<NativeTabLayoutProps, 'state' | 'descriptors'>) {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});
    const [lastReportsSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastReportsSearchQuerySelector});
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const openMoreTab = useOpenMoreTab();
    const hasSpendBeenShown = useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const getTabRoute = (routeName: string) => state.routes.find((tabRoute) => tabRoute.name === routeName);
    const spendNavigatorState = getTabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.state;
    const spendNavigatorKey = spendNavigatorState?.key;
    const spendRootRoute = spendNavigatorState?.routes.at(0);
    const spendRootRouteKey = spendRootRoute?.key;
    const spendRootQuery = spendRootRoute?.params && 'q' in spendRootRoute.params ? spendRootRoute.params.q : undefined;
    const {query: storedQuery, searchKey: storedSearchKey} = getStoredSearchTabParams(lastSearchParams, lastExpensesSearchQuery);
    const focusedRouteName = state.routes.at(state.index)?.name;
    const spendSearchKey = getStringParam(spendRootRoute?.params, 'searchKey');
    const tabBarItems = getNativeTabBarItems(focusedRouteName, spendSearchKey);
    const getNavigation = (routeName: string) => descriptors[getTabRoute(routeName)?.key ?? '']?.navigation;

    useEffect(() => {
        if (hasSpendBeenShown || !spendNavigatorKey || !spendRootRouteKey || spendRootQuery === storedQuery) {
            return;
        }
        navigationRef.dispatch({...CommonActions.setParams({q: storedQuery, searchKey: storedSearchKey}), source: spendRootRouteKey, target: spendNavigatorKey});
    }, [hasSpendBeenShown, spendNavigatorKey, spendRootRouteKey, spendRootQuery, storedQuery, storedSearchKey]);

    // Spend's own item starts the Spend spans in tabScreenListeners, so only taps on the item-only tabs start them here.
    const openSpendTab = (searchKey: SpendTabSearchKey, shouldStartSpans: boolean) => {
        if (focusedRouteName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR && spendSearchKey === searchKey) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            if (shouldStartSpans) {
                startNavigateToReportsTabSpans();
            }
            navigateToSpendTab(searchKey, searchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS ? lastReportsSearchQuery : lastExpensesSearchQuery, clearSelectedTransactions);
        });
    };

    // A tap on a More destination's item climbs back to the More page, the same as the JS More tab inside one.
    const onMoreSlotPress = (routeName: string) => {
        openMoreTab({isInMoreDestination: focusedRouteName === routeName && routeName !== SCREENS.MORE, isOnMorePage: focusedRouteName === SCREENS.MORE});
    };

    const onSpendPress = () => {
        const spendItem = tabBarItems[NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR];
        if (!spendItem || spendItem.isNativeSelectionEnabled) {
            return;
        }
        if (spendItem.kind === NATIVE_TAB_ITEM_KINDS.MORE) {
            onMoreSlotPress(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
            return;
        }
        openSpendTab(spendItem.kind === NATIVE_TAB_ITEM_KINDS.REPORTS ? CONST.SEARCH.SEARCH_KEYS.REPORTS : CONST.SEARCH.SEARCH_KEYS.EXPENSES, false);
    };

    const pressHandlers: Record<string, () => void> = {
        [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.EXPENSES, true),
        [SCREENS.NATIVE_TAB_ITEM.REPORTS_BEFORE_SPEND]: () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.REPORTS, true),
        [SCREENS.NATIVE_TAB_ITEM.REPORTS_AFTER_SPEND]: () => openSpendTab(CONST.SEARCH.SEARCH_KEYS.REPORTS, true),
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: onSpendPress,
        [SCREENS.MORE]: () => onMoreSlotPress(SCREENS.MORE),
        [SCREENS.INSIGHTS]: () => onMoreSlotPress(SCREENS.INSIGHTS),
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: () => onMoreSlotPress(NAVIGATORS.WORKSPACE_NAVIGATOR),
    };

    // Re-subscribed on every render, so each handler sees the current search and history.
    useEffect(() => {
        const removeListeners = Object.entries(pressHandlers).map(([routeName, handler]) => getNavigation(routeName)?.addListener('tabPress', handler));
        return () => {
            for (const removeListener of removeListeners) {
                removeListener?.();
            }
        };
    });

    return null;
}

export default TabPressListeners;
