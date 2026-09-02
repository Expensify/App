import type {NavigationPartialRoute, TabNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type RootTabState = {
    key?: string;
    routes: Array<{name: string; key?: string; state?: NavigationState}>;
    index?: number;
    // SwitchRouter tracks preloaded tabs here, but the public NavigationState type doesn't declare it.
    preloadedRouteKeys?: string[];
};

type RootNavigationState = NavigationState | PartialState<NavigationState> | undefined;

/**
 * Extracts the tab navigator state from a TAB_NAVIGATOR route.
 * Returns undefined if the route is not TAB_NAVIGATOR or has no state.
 */
function getTabState(route: {name: string; state?: NavigationState | {routes: Array<{name: string; key?: string}>; index?: number}} | undefined): RootTabState | undefined {
    if (route?.name === NAVIGATORS.TAB_NAVIGATOR && route.state) {
        return route.state as RootTabState;
    }
    return undefined;
}

/**
 * Extracts the tab navigator's own state from the root navigation state.
 */
function getTabNavigatorState(rootState: RootNavigationState): RootTabState | undefined {
    return getTabState(rootState?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR));
}

/**
 * Whether the Reports tab has been preloaded and not yet opened. Read before dispatching a tab navigation,
 * because jumping to the tab drops its key from `preloadedRouteKeys`.
 */
function isReportsTabPreloaded(rootState: RootNavigationState): boolean {
    const tabState = getTabNavigatorState(rootState);
    const reportsSplitRouteKey = tabState?.routes.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)?.key;
    return !!reportsSplitRouteKey && !!tabState?.preloadedRouteKeys?.includes(reportsSplitRouteKey);
}

/**
 * Extracts the inner screen name from a TAB_NAVIGATOR route's params.
 * Returns undefined if the route is not TAB_NAVIGATOR or has no screen param.
 */
function getTabScreenParam(route: NavigationPartialRoute | {name: string; params?: Record<string, unknown>} | undefined): keyof TabNavigatorParamList | undefined {
    if (route?.name === NAVIGATORS.TAB_NAVIGATOR && route.params && 'screen' in route.params) {
        return route.params.screen as keyof TabNavigatorParamList;
    }
    return undefined;
}

export {getTabState, getTabScreenParam, getTabNavigatorState, isReportsTabPreloaded};
