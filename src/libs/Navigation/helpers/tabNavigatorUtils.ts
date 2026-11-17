import type {NavigationPartialRoute, TabNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState, PartialState, TabNavigationState} from '@react-navigation/native';

// Partial because a linking-derived root state can still hold a tab route without a key, index or preload list.
type RootTabState = Partial<Pick<TabNavigationState<TabNavigatorParamList>, 'key' | 'index' | 'preloadedRouteKeys'>> & {
    routes: Array<{name: string; key?: string; state?: NavigationState}>;
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

function getTabNavigatorRoute(rootState: RootNavigationState) {
    return rootState?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
}

function getTabNavigatorState(rootState: RootNavigationState): RootTabState | undefined {
    return getTabState(getTabNavigatorRoute(rootState));
}

function getTabNavigatorStateKey(rootState: RootNavigationState): string | undefined {
    return getTabNavigatorState(rootState)?.key;
}

/** For screens inside the tab navigator: `tabState` is what `useNavigationState` hands them. */
function isTabRoutePreloaded(tabState: {routes: unknown[]; preloadedRouteKeys?: string[]}, routeKey: string): boolean {
    return !!tabState.preloadedRouteKeys?.includes(routeKey);
}

/** Read before dispatching a tab navigation: jumping to the tab drops its key from `preloadedRouteKeys`. */
function isTabPreloaded(rootState: RootNavigationState, tabRouteName: string): boolean {
    const tabState = getTabNavigatorState(rootState);
    const tabRouteKey = tabState?.routes.findLast((route) => route.name === tabRouteName)?.key;
    return !!tabRouteKey && !!tabState?.preloadedRouteKeys?.includes(tabRouteKey);
}

function isReportsTabPreloaded(rootState: RootNavigationState): boolean {
    return isTabPreloaded(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
}

function getFocusedTabRouteName(rootState: RootNavigationState): string | undefined {
    const tabState = getTabNavigatorState(rootState);
    return tabState?.index === undefined ? undefined : tabState.routes.at(tabState.index)?.name;
}

/** Undefined when preloading would be pure cost: a preloaded key drops `shouldFreeze`, with nothing to warm in return. */
function getTabPreloadTarget(rootState: RootNavigationState, tabRouteName: string): string | undefined {
    const tabState = getTabNavigatorState(rootState);
    const tabRoute = tabState?.routes.findLast((route) => route.name === tabRouteName);
    const focusedRouteName = getFocusedTabRouteName(rootState);

    if (!tabState?.key || !tabRoute || tabRoute.state || focusedRouteName === tabRouteName) {
        return undefined;
    }

    return tabState.key;
}

function getReportsTabPreloadTarget(rootState: RootNavigationState): string | undefined {
    return getTabPreloadTarget(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
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

export {
    getFocusedTabRouteName,
    getTabState,
    getTabScreenParam,
    getTabNavigatorRoute,
    getTabNavigatorState,
    getTabNavigatorStateKey,
    getReportsTabPreloadTarget,
    getTabPreloadTarget,
    isReportsTabPreloaded,
    isTabPreloaded,
    isTabRoutePreloaded,
};
