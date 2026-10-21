import {getStoredSearchTabParams} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';

import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import {CommonActions} from '@react-navigation/native';
import {useEffect} from 'react';

import type {NativeTabLayoutProps} from './NativeTabLayout';

/**
 * The native bar's Spend and Workspaces handling that needs Onyx data, so the data re-renders only this component.
 * Spend's first visit opens the latest search kept in Onyx, so the tab mounted at startup with the default search gets
 * it before it is first shown, both for the native bar and for the side bar of a wide layout. Workspaces restores the
 * last workspace, or the list for one that is gone, whenever the tab does not already show it.
 */
function TabPressListeners({state, descriptors}: Pick<NativeTabLayoutProps, 'state' | 'descriptors'>) {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});
    const hasSpendBeenShown = useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();
    const getTabRoute = (routeName: string) => state.routes.find((tabRoute) => tabRoute.name === routeName);
    const spendNavigatorState = getTabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.state;
    const spendNavigatorKey = spendNavigatorState?.key;
    const spendRootRoute = spendNavigatorState?.routes.at(0);
    const spendRootRouteKey = spendRootRoute?.key;
    const spendRootQuery = spendRootRoute?.params && 'q' in spendRootRoute.params ? spendRootRoute.params.q : undefined;
    const {query: storedQuery, searchKey: storedSearchKey} = getStoredSearchTabParams(lastSearchParams, lastExpensesSearchQuery);
    const workspacesDescriptor = descriptors[getTabRoute(NAVIGATORS.WORKSPACE_NAVIGATOR)?.key ?? ''];
    const workspacesNavigation = workspacesDescriptor?.navigation;
    const isWorkspacesSwitchedByJS = workspacesDescriptor?.options.tabBarSelectionEnabled === false;

    useEffect(() => {
        if (hasSpendBeenShown || !spendNavigatorKey || !spendRootRouteKey || spendRootQuery === storedQuery) {
            return;
        }
        navigationRef.dispatch({...CommonActions.setParams({q: storedQuery, searchKey: storedSearchKey}), source: spendRootRouteKey, target: spendNavigatorKey});
    }, [hasSpendBeenShown, spendNavigatorKey, spendRootRouteKey, spendRootQuery, storedQuery, storedSearchKey]);

    // Runs on the focused tab too, where it returns from a workspace to the list.
    useEffect(
        () =>
            workspacesNavigation?.addListener('tabPress', () => {
                if (!workspacesNavigation.isFocused() && !isWorkspacesSwitchedByJS) {
                    return;
                }
                navigateToWorkspaces();
            }),
        [workspacesNavigation, isWorkspacesSwitchedByJS, navigateToWorkspaces],
    );

    return null;
}

export default TabPressListeners;
