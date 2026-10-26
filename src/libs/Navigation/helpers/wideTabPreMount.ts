import {getTargetTabRoute} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationPartialRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';

import {isFullScreenName} from './isNavigatorName';
import {clearLiveWideTabPreMountKeys, markWideTabPreMountRouteKeyRevealed} from './wideTabPreMountRouteKey';

type TabRoute = NavigationState['routes'][number];

type TabStateWithPreloads = NavigationState & {preloadedRouteKeys?: string[]};

type WideTabPreMount = {
    /** TAB_NAVIGATOR state to dispatch, with the destination screen mounted inside the destination tab */
    tabState: TabStateWithPreloads;

    /** Key of the hidden destination screen, which the reveal shows instead of mounting a new one */
    routeKey: string;

    /** Whether the destination screen was already mounted, so cancel must leave it in place */
    isExistingRoute?: boolean;

    /** Key of the destination tab route, marked preloaded so a covered tab renders instead of staying frozen */
    addedPreloadedRouteKey?: string;

    /** Destination tab route before the pre-mount built its stack, so cancel can put it back. Only set when the tab had no stack */
    originalTabRoute?: TabRoute;

    /**
     * Key of the screen the pre-mount sits under in the focused tab. A history entry with this screen right above
     * the pre-mount is from before the reveal
     */
    coveringRouteKey?: string;
};

type LiveWideTabPreMount = Omit<WideTabPreMount, 'tabState' | 'coveringRouteKey'> & {
    /** Key of the TAB_NAVIGATOR state the pre-mount was dispatched to */
    tabStateKey: string;

    /** Name of the destination tab route */
    tabName: string;

    /**
     * Key of the screen the pre-mount sits under in the focused tab. Unlike in WideTabPreMount it is not optional,
     * so the reveal never misses it
     */
    coveringRouteKey: string | undefined;
};

let livePreMount: LiveWideTabPreMount | undefined;

function isRealizedStackState(state: TabRoute['state']): state is NavigationState {
    return !!state && state.stale === false && !!state.key && state.routes.length > 0;
}

/**
 * Builds the TAB_NAVIGATOR state with the submit destination mounted as a hidden screen, so the reveal only has to show it.
 * - Destination in the focused tab: the screen goes directly under the current screen, which stays on top.
 * - Destination in another tab: the screen goes on top of that tab's stack, and the tab is marked preloaded. When that tab
 *   already shows the destination, its mounted screen is reused as it is.
 * Returns undefined when the destination cannot be pre-mounted or the focused tab already shows it.
 */
function buildWideTabPreMount(tabState: TabStateWithPreloads, focusedTargetTab: NavigationPartialRoute, routeKey: string): WideTabPreMount | undefined {
    const targetTabIndex = tabState.routes.findIndex((route) => route.name === focusedTargetTab.name);
    const targetTabRoute = tabState.routes.at(targetTabIndex);
    const destination = focusedTargetTab.state?.routes.at(-1);
    if (targetTabIndex < 0 || !targetTabRoute || !destination) {
        return undefined;
    }
    const destinationRoute = {name: destination.name, key: routeKey, ...(destination.params ? {params: destination.params} : {})};
    const nestedState = isRealizedStackState(targetTabRoute.state) ? targetTabRoute.state : undefined;
    const withTargetTabRoute = (route: TabRoute): TabRoute[] => tabState.routes.map((tabRoute, index) => (index === targetTabIndex ? route : tabRoute));

    if (targetTabIndex === tabState.index) {
        // Search in the focused tab is skipped: the mounted Search can just navigate, which is cheaper than a second one under it.
        // A destination this tab's stack cannot hold is skipped too.
        if (focusedTargetTab.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR || !nestedState?.routeNames.includes(destination.name)) {
            return undefined;
        }
        const currentRoute = nestedState.routes.at(nestedState.index);
        if (!currentRoute || (currentRoute.name === destination.name && deepEqual(currentRoute.params ?? {}, destination.params ?? {}))) {
            return undefined;
        }
        const routes = [...nestedState.routes.slice(0, nestedState.index), destinationRoute, ...nestedState.routes.slice(nestedState.index)];
        return {
            tabState: {...tabState, routes: withTargetTabRoute({...targetTabRoute, state: {...nestedState, routes, index: nestedState.index + 1}})},
            routeKey,
            coveringRouteKey: currentRoute.key,
        };
    }

    const preloadedRouteKeys = tabState.preloadedRouteKeys ?? [];
    const addedPreloadedRouteKey = preloadedRouteKeys.includes(targetTabRoute.key) ? undefined : targetTabRoute.key;
    const nextPreloadedRouteKeys = addedPreloadedRouteKey ? [...preloadedRouteKeys, addedPreloadedRouteKey] : preloadedRouteKeys;

    if (nestedState) {
        if (!nestedState.routeNames.includes(destination.name)) {
            return undefined;
        }
        const currentRoute = nestedState.routes.at(nestedState.index);
        if (currentRoute?.name === destination.name && deepEqual(currentRoute.params ?? {}, destination.params ?? {})) {
            return {tabState: {...tabState, preloadedRouteKeys: nextPreloadedRouteKeys}, routeKey: currentRoute.key, isExistingRoute: true, addedPreloadedRouteKey};
        }
        const routes = [...nestedState.routes, destinationRoute];
        return {
            tabState: {...tabState, routes: withTargetTabRoute({...targetTabRoute, state: {...nestedState, routes, index: routes.length - 1}}), preloadedRouteKeys: nextPreloadedRouteKeys},
            routeKey,
            addedPreloadedRouteKey,
        };
    }

    // The tab was never opened, so its stack is built with getTargetTabRoute like the reveal does. The destination gets
    // the pre-mount key so the reveal can find it.
    const builtTabRoute = getTargetTabRoute(targetTabRoute, focusedTargetTab);
    const builtRoutes = builtTabRoute.state?.routes;
    if (!builtRoutes?.length) {
        return undefined;
    }
    const backRoutes = builtRoutes.slice(0, -1).map((route) => ({name: route.name, ...('key' in route ? {key: route.key} : {}), ...(route.params ? {params: route.params} : {})}));
    const routes: PartialState<NavigationState>['routes'] = [...backRoutes, destinationRoute];
    return {
        tabState: {...tabState, routes: withTargetTabRoute({...targetTabRoute, state: {routes, index: routes.length - 1}}), preloadedRouteKeys: nextPreloadedRouteKeys},
        routeKey,
        addedPreloadedRouteKey,
        originalTabRoute: targetTabRoute,
    };
}

/** Builds the TAB_NAVIGATOR state with a pre-mount taken out again, leaving the destination tab as it was before. */
function buildCancelledWideTabPreMount(tabState: TabStateWithPreloads, preMount: LiveWideTabPreMount): TabStateWithPreloads | undefined {
    const targetTabRoute = tabState.routes.find((route) => route.name === preMount.tabName);
    const nestedState = isRealizedStackState(targetTabRoute?.state) ? targetTabRoute.state : undefined;
    const preMountedIndex = nestedState?.routes.findIndex((route) => route.key === preMount.routeKey) ?? -1;
    if (!targetTabRoute || (!preMount.originalTabRoute && !preMount.isExistingRoute && (!nestedState || preMountedIndex < 0))) {
        return undefined;
    }

    let restoredTabRoute: TabRoute = preMount.originalTabRoute ?? targetTabRoute;
    if (!preMount.originalTabRoute && !preMount.isExistingRoute && nestedState) {
        const routes = nestedState.routes.filter((route) => route.key !== preMount.routeKey);
        const index = preMountedIndex < nestedState.index ? nestedState.index - 1 : Math.min(nestedState.index, routes.length - 1);
        restoredTabRoute = {...targetTabRoute, state: {...nestedState, routes, index}};
    }
    const preloadedRouteKeys = preMount.addedPreloadedRouteKey ? tabState.preloadedRouteKeys?.filter((key) => key !== preMount.addedPreloadedRouteKey) : tabState.preloadedRouteKeys;
    return {...tabState, routes: tabState.routes.map((route) => (route.name === preMount.tabName ? restoredTabRoute : route)), ...(preloadedRouteKeys ? {preloadedRouteKeys} : {})};
}

function getCurrentTabState(): TabStateWithPreloads | undefined {
    const tabRoute = navigationRef.getRootState()?.routes.findLast((route) => isFullScreenName(route.name));

    // Another fullscreen (e.g. a Workspace split) covering the tab navigator would keep a pre-mount there out of sight.
    if (tabRoute?.name !== NAVIGATORS.TAB_NAVIGATOR) {
        return undefined;
    }
    const tabState = tabRoute.state;
    return tabState && tabState.stale === false && tabState.key ? (tabState as TabStateWithPreloads) : undefined;
}

/** State of the tab navigator a pre-mount was built in. Found by key, so it is found even when another fullscreen covers it. */
function getPreMountTabState(tabStateKey: string): TabStateWithPreloads | undefined {
    const tabState = navigationRef.getRootState()?.routes.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR && route.state?.key === tabStateKey)?.state;
    return tabState && tabState.stale === false ? (tabState as TabStateWithPreloads) : undefined;
}

/** True while the tab navigator holding the live pre-mount is the topmost fullscreen, the only case where a reveal can show it. */
function isWideTabPreMountInTopFullscreen(): boolean {
    return !!livePreMount && getCurrentTabState()?.key === livePreMount.tabStateKey;
}

/** Ends the live pre-mount after the reveal showed it, marking its key as revealed. */
function finishWideTabPreMountReveal(routeKey: string) {
    if (livePreMount?.routeKey !== routeKey) {
        return;
    }
    markWideTabPreMountRouteKeyRevealed(routeKey, livePreMount.coveringRouteKey);
    livePreMount = undefined;
    clearLiveWideTabPreMountKeys();
}

/** Takes a pre-mount out again when the submit did not happen, restoring the destination tab. */
function cancelWideTabPreMount() {
    const preMount = livePreMount;
    if (!preMount) {
        return;
    }
    livePreMount = undefined;
    const tabState = getPreMountTabState(preMount.tabStateKey);
    const cancelledTabState = tabState ? buildCancelledWideTabPreMount(tabState, preMount) : undefined;
    if (tabState && cancelledTabState) {
        navigationRef.dispatch({...CommonActions.reset(cancelledTabState), target: tabState.key});
    }

    // Live keys are cleared after the dispatch, so the screen stays unfrozen until React commits its removal.
    clearLiveWideTabPreMountKeys();
}

/** Forgets a pre-mount the reveal did not show. The replace has already removed its screen from the stack. */
function discardWideTabPreMount() {
    if (!livePreMount) {
        return;
    }
    livePreMount = undefined;
    clearLiveWideTabPreMountKeys();
}

export {buildWideTabPreMount, buildCancelledWideTabPreMount, finishWideTabPreMountReveal, cancelWideTabPreMount, discardWideTabPreMount, isWideTabPreMountInTopFullscreen};
export type {LiveWideTabPreMount, TabStateWithPreloads};
