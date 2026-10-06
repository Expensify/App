import {getStoredSearchTabRoute} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import {useEffect} from 'react';

import type {NativeTabLayoutProps} from './NativeTabLayout';

/**
 * The native bar's taps on Spend and Workspaces, which run the JS tab buttons' navigation and need Onyx data, so the
 * data re-renders only this component. Spend's first visit opens the latest search kept in Onyx, because the tab
 * mounted at startup shows the default one. Workspaces restores the last workspace, or the list for one that is gone.
 */
function TabPressListeners({state, descriptors}: Pick<NativeTabLayoutProps, 'state' | 'descriptors'>) {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();
    const getDescriptor = (routeName: string) => {
        const route = state.routes.find((tabRoute) => tabRoute.name === routeName);
        return route ? descriptors[route.key] : undefined;
    };
    const spendDescriptor = getDescriptor(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const spendNavigation = spendDescriptor?.navigation;
    const isSpendSwitchedByJS = spendDescriptor?.options.tabBarSelectionEnabled === false;
    const workspacesNavigation = getDescriptor(NAVIGATORS.WORKSPACE_NAVIGATOR)?.navigation;

    useEffect(
        () =>
            spendNavigation?.addListener('tabPress', () => {
                if (spendNavigation.isFocused()) {
                    return;
                }
                interceptAnonymousUser(() => {
                    startNavigateToReportsTabSpans();
                    if (isSpendSwitchedByJS) {
                        Navigation.navigate(getStoredSearchTabRoute(lastSearchParams, lastExpensesSearchQuery));
                    }
                });
            }),
        [spendNavigation, isSpendSwitchedByJS, lastSearchParams, lastExpensesSearchQuery],
    );

    // Runs on the focused tab too, where it returns from a workspace to the list.
    useEffect(() => workspacesNavigation?.addListener('tabPress', navigateToWorkspaces), [workspacesNavigation, navigateToWorkspaces]);

    return null;
}

export default TabPressListeners;
