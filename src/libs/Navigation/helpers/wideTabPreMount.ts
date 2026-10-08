import Log from '@libs/Log';
import {getTargetTabRoute} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationPartialRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';

import {isFullScreenName} from './isNavigatorName';
import {
    createWideTabPreMountRouteKey,
    markWideTabPreMountRouteKeyRevealed,
    setLiveWideTabPreMountPreloadedRouteKey,
    setLiveWideTabPreMountRouteKey,
    setLiveWideTabPreMountTabRouteKey,
} from './wideTabPreMountRouteKey';

type TabRoute = NavigationState['routes'][number];

type TabStateWithPreloads = NavigationState & {preloadedRouteKeys?: string[]};

type WideTabPreMount = {
    /** Next state of the TAB_NAVIGATOR, with the destination screen mounted inside the destination tab */
    tabState: TabStateWithPreloads;

    /** Key of the destination screen the reveal reuses */
    routeKey: string;

    /** Whether the destination screen was already mounted, so cancel must leave it in place */
    isExistingRoute?: boolean;

    /** Key of the destination tab route, marked preloaded so a covered tab renders instead of staying frozen */
    addedPreloadedRouteKey?: string;

    /** Destination tab route as it was, when the pre-mount had to create its stack and cancel must put it back */
    originalTabRoute?: TabRoute;
};

type LiveWideTabPreMount = Omit<WideTabPreMount, 'tabState'> & {
    /** Key of the TAB_NAVIGATOR state the pre-mount was dispatched to */
    tabStateKey: string;

    /** Name of the destination tab route */
    tabName: string;
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
 * Returns undefined when there is nothing worth pre-mounting.
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
        // Search renders only from its last root screen, so a second one could not stay mounted under the current one.
        // Navigating within the mounted Search is also cheaper than a pre-mount there.
        if (focusedTargetTab.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR || !nestedState?.routeNames.includes(destination.name)) {
            return undefined;
        }
        const currentRoute = nestedState.routes.at(nestedState.index);
        if (!currentRoute || (currentRoute.name === destination.name && deepEqual(currentRoute.params ?? {}, destination.params ?? {}))) {
            return undefined;
        }
        const routes = [...nestedState.routes.slice(0, nestedState.index), destinationRoute, ...nestedState.routes.slice(nestedState.index)];
        return {tabState: {...tabState, routes: withTargetTabRoute({...targetTabRoute, state: {...nestedState, routes, index: nestedState.index + 1}})}, routeKey};
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

    // The tab never mounted, so its stack is built the way the reveal builds it, with the destination keyed for reuse.
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

/** State of the tab navigator a pre-mount was built in, found by key so a fullscreen covering it does not hide it. */
function getPreMountTabState(tabStateKey: string): TabStateWithPreloads | undefined {
    const tabState = navigationRef.getRootState()?.routes.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR && route.state?.key === tabStateKey)?.state;
    return tabState && tabState.stale === false ? (tabState as TabStateWithPreloads) : undefined;
}

/**
 * Mounts the wide-layout submit destination as a hidden screen inside the current TAB_NAVIGATOR. The single navigator
 * instance is kept, so visited tabs keep their state. Returns the key of the pre-mounted screen, or undefined when skipped.
 */
function preMountWideDestinationInTab(focusedTargetTab: NavigationPartialRoute): string | undefined {
    const tabState = getCurrentTabState();
    const destinationName = focusedTargetTab.state?.routes.at(-1)?.name;
    if (!tabState || !destinationName || livePreMount) {
        return undefined;
    }
    const preMount = buildWideTabPreMount(tabState, focusedTargetTab, createWideTabPreMountRouteKey(destinationName));
    if (!preMount) {
        return undefined;
    }
    const {routeKey} = preMount;

    // Set before the dispatch, so the stack keeps the screen attached and unfrozen from its very first render.
    setLiveWideTabPreMountRouteKey(routeKey);
    setLiveWideTabPreMountPreloadedRouteKey(preMount.addedPreloadedRouteKey);
    setLiveWideTabPreMountTabRouteKey(tabState.routes.find((route) => route.name === focusedTargetTab.name)?.key);
    navigationRef.dispatch({...CommonActions.reset(preMount.tabState), target: tabState.key});
    const nextTabState = getCurrentTabState();
    const targetTabRoute = nextTabState?.routes.find((route) => route.name === focusedTargetTab.name);
    // A tab that never mounted has no navigator to read its new stack back from yet, only the preload marks the dispatch.
    const isPreMounted = isRealizedStackState(targetTabRoute?.state)
        ? targetTabRoute.state.routes.some((route) => route.key === routeKey)
        : !!targetTabRoute && !!nextTabState?.preloadedRouteKeys?.includes(targetTabRoute.key);
    if (!isPreMounted) {
        setLiveWideTabPreMountRouteKey(undefined);
        setLiveWideTabPreMountPreloadedRouteKey(undefined);
        setLiveWideTabPreMountTabRouteKey(undefined);
        Log.hmmm('[Navigation] Wide pre-mount in tab dispatch was ignored', {destinationName});
        return undefined;
    }

    livePreMount = {
        routeKey,
        isExistingRoute: preMount.isExistingRoute,
        tabStateKey: tabState.key,
        tabName: focusedTargetTab.name,
        addedPreloadedRouteKey: preMount.addedPreloadedRouteKey,
        originalTabRoute: preMount.originalTabRoute,
    };
    return routeKey;
}

/** True while the live pre-mount sits in the tab navigator shown as the top fullscreen, the only place a reveal can show it. */
function isWideTabPreMountInTopFullscreen(): boolean {
    return !!livePreMount && getCurrentTabState()?.key === livePreMount.tabStateKey;
}

/** Hands the pre-mount over to the reveal, which shows the pre-mounted screen as the destination. */
function finishWideTabPreMountReveal(routeKey: string) {
    if (livePreMount?.routeKey !== routeKey) {
        return;
    }
    markWideTabPreMountRouteKeyRevealed(routeKey);
    livePreMount = undefined;
    setLiveWideTabPreMountRouteKey(undefined);
    setLiveWideTabPreMountPreloadedRouteKey(undefined);
    setLiveWideTabPreMountTabRouteKey(undefined);
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
    // Cleared after the dispatch, so the screen stays unfrozen until the commit that removes it.
    setLiveWideTabPreMountRouteKey(undefined);
    setLiveWideTabPreMountPreloadedRouteKey(undefined);
    setLiveWideTabPreMountTabRouteKey(undefined);
}

export {buildWideTabPreMount, buildCancelledWideTabPreMount, preMountWideDestinationInTab, finishWideTabPreMountReveal, cancelWideTabPreMount, isWideTabPreMountInTopFullscreen};
export type {LiveWideTabPreMount, TabStateWithPreloads};
