import type {CommonActions, NavigationState, PartialState, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import Log from '@libs/Log';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import buildTabNavigatorNestedState from '@libs/Navigation/helpers/buildTabNavigatorNestedState';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {SIDEBAR_TO_SPLIT, SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {
    PushActionType,
    RemoveFullscreenUnderRHPActionType,
    ReplaceActionType,
    ReplaceFullscreenUnderRHPActionType,
    ToggleMfaModalNavigatorWithHistoryActionType,
    ToggleModalWithHistoryActionType,
    ToggleSidePanelWithHistoryActionType,
} from './types';

const SCREENS_WITH_NAVIGATION_TAB_BAR = new Set([
    ...Object.keys(SIDEBAR_TO_SPLIT),
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.SEARCH.ROOT,
    SCREENS.WORKSPACES_LIST,
    SCREENS.HOME,
]);

const MODAL_ROUTES_TO_DISMISS = new Set<string>([
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR,
    NAVIGATORS.SHARE_MODAL_NAVIGATOR,
    NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR,
    NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR,
    SCREENS.NOT_FOUND,
    SCREENS.REPORT_ATTACHMENTS,
    SCREENS.REPORT_ADD_ATTACHMENT,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW,
    SCREENS.MONEY_REQUEST.ODOMETER_PREVIEW,
    SCREENS.DYNAMIC_PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.WORKSPACE_DOCUMENT,
    SCREENS.REPORT_AVATAR,
    SCREENS.CONCIERGE,
    SCREENS.SEARCH_ROUTER.ROOT,
]);

const screensWithEnteringAnimation = new Set<string>();
function getSidebarRouteName(routeName: string): string | undefined {
    return routeName in SPLIT_TO_SIDEBAR ? SPLIT_TO_SIDEBAR[routeName as keyof typeof SPLIT_TO_SIDEBAR] : undefined;
}

// RN's deep-link initial-state hint keys, per `getStateFromParams` in
// @react-navigation/core/src/useNavigationBuilder.tsx. Stripped only when `params.screen` is
// set so legitimate user keys (e.g. `path`, `initial`) on non-hydrated routes survive.
const STALE_DEEP_LINK_PARAM_KEYS = new Set(['state', 'screen', 'params', 'path', 'initial']);

/** Removes the RN deep-link hint chain from `route.params` when triggered by `params.screen`. */
function withSanitizedDeepLinkParams<R extends {params?: unknown}>(route: R, focusParams: unknown): R {
    const rParamsRecord =
        route.params && typeof route.params === 'object' && !Array.isArray(route.params) && 'screen' in route.params && typeof route.params.screen === 'string' ? route.params : undefined;

    // RN stores nested deep-link instructions under params.screen/params.params.
    const looksLikeDeepLinkInitialState = !!rParamsRecord;

    // Remove only RN's hint keys; keep any real params that were stored next to them.
    const sanitizedExistingParams = rParamsRecord ? Object.fromEntries(Object.entries(rParamsRecord).filter(([key]) => !STALE_DEEP_LINK_PARAM_KEYS.has(key))) : undefined;
    const hasSanitizedExistingParams = !!sanitizedExistingParams && Object.keys(sanitizedExistingParams).length > 0;
    const fallbackParams = hasSanitizedExistingParams ? sanitizedExistingParams : undefined;

    // The new focused tab params win; otherwise keep the cleaned existing params.
    const nextParams = focusParams ?? fallbackParams;

    if (nextParams !== undefined) {
        return {...route, params: nextParams};
    }
    if (looksLikeDeepLinkInitialState) {
        // If params only contained stale RN hints, remove params entirely.
        const routeWithoutParams = {...route};
        delete (routeWithoutParams as {params?: unknown}).params;
        return routeWithoutParams;
    }
    return {...route};
}

/**
 * Stores the original TAB_NAVIGATOR route before a tab-switch pre-insertion
 * (handleReplaceFullscreenUnderRHP). Restored on cancel by handleRemoveFullscreenUnderRHP,
 * or cleared by clearPreInsertedOriginalTabRoute when navigation commits successfully.
 */
let preInsertedOriginalTabRoute: StackNavigationState<ParamListBase>['routes'][number] | undefined;

function getPreInsertedOriginalTabRoute(): StackNavigationState<ParamListBase>['routes'][number] | undefined {
    return preInsertedOriginalTabRoute;
}

function clearPreInsertedOriginalTabRoute() {
    preInsertedOriginalTabRoute = undefined;
}

/** Shape of `action.payload.params` when pushing the root tab navigator with a nested tab route (`screen` + optional `params`). */
type TabNavigatorPushPayloadParams = {
    screen: string;
    params?: Record<string, unknown>;
};

type TabRouteForReplacement = NavigationState['routes'][number] | NavigationPartialRoute;
type TabStateForReplacement = Omit<NavigationState, 'routes' | 'stale'> & {routes: TabRouteForReplacement[]; stale?: true | false};
type StaleTabStateOverrides = {routes: TabRouteForReplacement[]; index: number; routeNames?: string[]};

function toStaleTabState(existingTabState: NavigationState | undefined, overrides: StaleTabStateOverrides): TabStateForReplacement {
    return {
        type: existingTabState?.type ?? 'tab',
        key: existingTabState?.key ?? '',
        stale: true as const,
        routeNames: overrides.routeNames ?? existingTabState?.routeNames ?? [...TAB_SCREENS],
        routes: overrides.routes,
        index: overrides.index,
        history: existingTabState?.history ?? [],
    };
}

/**
 * True when this push is `TAB_NAVIGATOR` with nested `{ screen, params }`. That combination is the case we patch below:
 * the stack route can carry `screen`/`params` as *initial* child navigation hints, which is not the same as having a
 * full `params.state` subtree computed up front.
 */
function isPushTabNavigatorWithScreenParam(action: PushActionType): boolean {
    return (
        action.payload.name === NAVIGATORS.TAB_NAVIGATOR &&
        !!action.payload.params &&
        typeof action.payload.params === 'object' &&
        'screen' in action.payload.params &&
        typeof (action.payload.params as {screen?: unknown}).screen === 'string'
    );
}

/**
 * Returns stack state after rehydrating a `TAB_NAVIGATOR` push, with `params.state` holding the full tab subtree
 * (same shape as deep links). Without that, `useNavigationBuilder` runs a follow-up NAVIGATE after mount and
 * `fullHistory` gains a duplicate entry (e.g. Home).
 */
function getRehydratedTabNavigatorStateAfterPush(rehydratedState: StackNavigationState<ParamListBase>, tabPushParams: TabNavigatorPushPayloadParams): StackNavigationState<ParamListBase> {
    const rehydratedLastRoute = rehydratedState.routes.at(-1);

    if (rehydratedLastRoute?.name !== NAVIGATORS.TAB_NAVIGATOR) {
        return rehydratedState;
    }

    const {screen: screenName, params: nestedParams} = tabPushParams;
    const existingTabState = rehydratedLastRoute.state as NavigationState | undefined;
    const existingTabRoute = existingTabState?.routes?.find((r) => r.name === screenName);
    const tabParams = (nestedParams ?? existingTabRoute?.params) as Record<string, unknown> | undefined;

    const selectedTabRoute: NavigationPartialRoute = {
        name: screenName,
        ...(tabParams ? {params: tabParams} : {}),
        ...(existingTabRoute?.state ? {state: existingTabRoute.state as PartialState<NavigationState>} : {}),
    };

    const tabNavigatorNestedState = buildTabNavigatorNestedState(selectedTabRoute);
    const paramsWithoutNestedTarget = Object.fromEntries(
        Object.entries((rehydratedLastRoute.params ?? {}) as Record<string, unknown>).filter(([key]) => key !== 'screen' && key !== 'params'),
    ) as Record<string, unknown>;

    const updatedLastRoute = {
        ...rehydratedLastRoute,
        params: {
            ...paramsWithoutNestedTarget,
            // RN tab partial state is wider than NavigationState; params.state accepts PartialState.
            state: tabNavigatorNestedState as unknown as PartialState<NavigationState>,
        },
    };

    return {
        ...rehydratedState,
        routes: [...rehydratedState.routes.slice(0, -1), updatedLastRoute],
    } as StackNavigationState<ParamListBase>;
}

/**
 * Returns the focused child route from a navigator `state` (respects `index`).
 * Using `routes.at(-1)` is wrong for TabNavigator: tab order follows TAB_SCREENS, not selection.
 */
function getFocusedRouteFromNavigatorState(navState: NavigationState | PartialState<NavigationState> | undefined): NavigationPartialRoute | undefined {
    if (!navState?.routes?.length) {
        return undefined;
    }
    const idx =
        typeof navState.index === 'number' && navState.routes[navState.index] !== undefined
            ? navState.index
            : // Partial states from linking should include `index`; fall back to first route.
              0;
    return navState.routes[idx] as NavigationPartialRoute;
}

function getTargetTabRoute(existingTabRoute: TabRouteForReplacement | undefined, focusedTargetTab: NavigationPartialRoute): TabRouteForReplacement {
    // Prepend a back-target route beneath the incoming screen when the incoming state starts with a
    // different screen, so back navigation lands somewhere sensible: the existing sidebar/root route
    // (e.g. Inbox) for most tabs, or WORKSPACES_LIST for the workspace navigator. When the existing tab
    // doesn't have nested routes (e.g. cold-start through a deep link that opens straight into a modal),
    // fall back to the split navigator's default sidebar route so there is still something to pop back to.
    let mergedNestedState = focusedTargetTab.state;
    const existingNestedRoutes = (existingTabRoute?.state as PartialState<NavigationState> | undefined)?.routes;
    const newNestedRoutes = focusedTargetTab.state?.routes;
    const existingFirstRoute = existingNestedRoutes?.at(0);
    const newFirstRoute = newNestedRoutes?.at(0);
    const defaultSidebarRouteName = getSidebarRouteName(existingTabRoute?.name ?? focusedTargetTab.name);
    // The route prepended beneath the incoming screen so back navigation has a target. For most tabs this is
    // the sidebar/root route; for WORKSPACE_NAVIGATOR it is WORKSPACES_LIST (a list screen, not a sidebar).
    let backTargetRoute: NavigationPartialRoute | undefined;
    if (focusedTargetTab.name === NAVIGATORS.WORKSPACE_NAVIGATOR) {
        // Always seed a FRESH (keyless) WORKSPACES_LIST so it mounts born-non-top, even when the
        // user backed into the list and it is the mounted, visible top. Reusing the existing list's key
        // makes react-native-screens reorder it top->non-top during the reveal and flash it (#90985). A
        // keyless route is never the active top, so there is no reorder to flash; it gets a fresh key on
        // rehydration. The list's params (e.g. backTo) are carried over so the back target survives.
        // The prepend below is a no-op when the incoming state already starts with WORKSPACES_LIST.
        const existingListParams = existingFirstRoute?.name === SCREENS.WORKSPACES_LIST ? existingFirstRoute.params : undefined;
        backTargetRoute = {name: SCREENS.WORKSPACES_LIST, ...(existingListParams ? {params: existingListParams} : {})};
    } else {
        backTargetRoute = existingFirstRoute ?? (defaultSidebarRouteName ? {name: defaultSidebarRouteName} : undefined);
    }
    if (backTargetRoute && newFirstRoute && backTargetRoute.name !== newFirstRoute.name) {
        const prependedRoutes = [backTargetRoute, ...(newNestedRoutes ?? [])];
        mergedNestedState = {...focusedTargetTab.state, routes: prependedRoutes, index: prependedRoutes.length - 1};
    }

    if (!existingTabRoute) {
        return {
            name: focusedTargetTab.name,
            ...(focusedTargetTab.params ? {params: focusedTargetTab.params} : {}),
            ...(mergedNestedState ? {state: mergedNestedState} : {}),
        };
    }

    // Strip any RN deep-link hint chain from `existingTabRoute.params`; otherwise RN would run a
    // follow-up NAVIGATE from it and override the `state` we splice below.
    const sanitizedRoute = withSanitizedDeepLinkParams(existingTabRoute, focusedTargetTab.params);
    return {
        ...sanitizedRoute,
        ...(mergedNestedState !== undefined ? {state: mergedNestedState} : {}),
    };
}

function getTabStateWithExistingFocusedTarget(existingTabState: NavigationState, focusedTargetTab: NavigationPartialRoute): TabStateForReplacement | undefined {
    const targetTabIndex = existingTabState.routes.findIndex((r) => r.name === focusedTargetTab.name);

    if (targetTabIndex < 0) {
        return undefined;
    }

    const updatedTabRoutes = existingTabState.routes.map((route, index) => {
        if (index !== targetTabIndex) {
            return route;
        }
        return getTargetTabRoute(route, focusedTargetTab);
    });
    return {...existingTabState, routes: updatedTabRoutes, index: targetTabIndex};
}

function getTabStateWithFocusedTarget(existingTabState: NavigationState | undefined, focusedTargetTab: NavigationPartialRoute): TabStateForReplacement | undefined {
    if (existingTabState?.routes?.length) {
        const tabStateWithExistingTarget = getTabStateWithExistingFocusedTarget(existingTabState, focusedTargetTab);
        if (tabStateWithExistingTarget) {
            return tabStateWithExistingTarget;
        }
    }

    const completeTabState = buildTabNavigatorNestedState(focusedTargetTab);
    const completeTargetTabIndex = completeTabState.routes.findIndex((route) => route.name === focusedTargetTab.name);
    if (completeTargetTabIndex < 0) {
        return undefined;
    }

    const updatedTabRoutes = completeTabState.routes.map((route) => {
        if (route.name === focusedTargetTab.name) {
            return getTargetTabRoute(undefined, focusedTargetTab);
        }
        return existingTabState?.routes.find((r) => r.name === route.name) ?? route;
    });

    // Mark the reconstructed state as stale so TabRouter.getRehydratedState()
    // assigns route keys and rebuilds history from scratch. Without this, the
    // state would inherit stale: false from the existing realized state, and the
    // router would trust the keyless partial routes as-is.
    // Preserve history so valid existing tab entries still work after the reveal;
    // TabRouter filters entries whose route keys are no longer present.
    return toStaleTabState(existingTabState, {
        routeNames: [...TAB_SCREENS],
        routes: updatedTabRoutes,
        index: completeTargetTabIndex,
    });
}

function handlePushFullscreenAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
): StackNavigationState<ParamListBase> | null {
    const targetScreen = action.payload?.params && 'screen' in action.payload.params ? (action.payload?.params?.screen as string) : undefined;
    const navigatorName = action.payload.name;

    const stateWithNavigator = stackRouter.getStateForAction(state, action, configOptions);

    if (!stateWithNavigator) {
        Log.hmmm(`[handlePushAction] ${navigatorName} has not been found in the navigation state.`);
        return null;
    }

    let resultState = stateWithNavigator as StackNavigationState<ParamListBase>;

    // Pushing TAB_NAVIGATOR with only { screen, params } makes useNavigationBuilder apply a follow-up
    // NAVIGATE after mount; with backBehavior="fullHistory" that appends an extra tab history entry.
    // getRehydratedTabNavigatorStateAfterPush sets params.state like deep links and avoids that.
    // Rehydrate only in this branch — other fullscreen pushes rely on addRootHistoryRouterExtension alone.
    if (isPushTabNavigatorWithScreenParam(action)) {
        const rehydratedState = stackRouter.getRehydratedState(stateWithNavigator, configOptions);
        const tabPushParams = action.payload.params as TabNavigatorPushPayloadParams;
        resultState = getRehydratedTabNavigatorStateAfterPush(rehydratedState, tabPushParams);
    }

    const lastFullScreenRoute = resultState.routes.at(-1);

    // Cross-tab TAB_NAVIGATOR pushes animate/allow swipe-back even though targetScreen names a tab.
    const isTabNavigatorPush = navigatorName === NAVIGATORS.TAB_NAVIGATOR;
    if (lastFullScreenRoute?.key && targetScreen && (isTabNavigatorPush || !SCREENS_WITH_NAVIGATION_TAB_BAR.has(targetScreen))) {
        screensWithEnteringAnimation.add(lastFullScreenRoute.key);
    }
    return resultState;
}

function handleReplaceReportsSplitNavigatorAction(
    state: StackNavigationState<ParamListBase>,
    action: ReplaceActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const stateWithReportsSplitNavigator = stackRouter.getStateForAction(state, action, configOptions);

    if (!stateWithReportsSplitNavigator) {
        Log.hmmm('[handleReplaceReportsSplitNavigatorAction] ReportsSplitNavigator has not been found in the navigation state.');
        return null;
    }

    const lastReportsSplitNavigator = stateWithReportsSplitNavigator.routes.at(-1);

    // ReportScreen should always be opened with an animation when replacing the navigator
    if (lastReportsSplitNavigator?.key) {
        screensWithEnteringAnimation.add(lastReportsSplitNavigator.key);
    }

    return stateWithReportsSplitNavigator;
}

/**
 * Strips the key from the focused tab route and marks the tab state as stale so
 * the tab router rehydrates and assigns a fresh key. This forces React to unmount
 * and remount the focused split navigator with the pre-inserted screen already in
 * its initial layout - avoiding the push-transition flash that react-native-screens
 * would otherwise play when a new screen is added to an existing ScreenStack.
 * The original tab history is preserved so valid non-focused tab back entries survive
 * rehydration; TabRouter filters out any entry whose route key no longer exists.
 */
function markFocusedTabRouteForRemount(tabState: TabStateForReplacement, existingTabState: NavigationState): TabStateForReplacement {
    const focusedRoute = tabState.routes[tabState.index];
    if (!focusedRoute || !('key' in focusedRoute)) {
        return tabState;
    }

    const patchedRoutes = [...tabState.routes];
    const routeWithoutKey = {...focusedRoute};
    delete (routeWithoutKey as Partial<Pick<typeof routeWithoutKey, 'key'>>).key;
    patchedRoutes[tabState.index] = routeWithoutKey as TabRouteForReplacement;

    return toStaleTabState(existingTabState, {
        routes: patchedRoutes,
        index: tabState.index,
    });
}

/**
 * Handles the REPLACE_FULLSCREEN_UNDER_RHP action.
 *
 * Pre-inserts a destination screen underneath the currently open RHP so that dismissing
 * the modal reveals the target without an extra navigation step.
 *
 * When the target is a TAB_NAVIGATOR screen (Home, Search, etc.), we switch tabs within
 * the single existing TAB_NAVIGATOR instance instead of pushing a duplicate. The original
 * TAB_NAVIGATOR route is saved to `preInsertedOriginalTabRoute` so it can be fully
 * restored if the user cancels (see handleRemoveFullscreenUnderRHP).
 *
 * State transition for tab targets: [Tab(A), RHP] -> [Tab(B), RHP]
 * State transition for other fullscreen targets: [FS, RHP] -> [FS, FS', RHP]
 *
 * @see removePreInsertedFullscreenIfNeeded in Navigation.ts — the caller that cleans up
 *      the pre-insertion when the user cancels.
 */
function handleReplaceFullscreenUnderRHP(
    state: StackNavigationState<ParamListBase>,
    action: ReplaceFullscreenUnderRHPActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const stateFromPath = getStateFromPath(action.payload.route);
    const targetRoute = stateFromPath?.routes.findLast((r) => isFullScreenName(r.name));
    if (!targetRoute) {
        return null;
    }

    // Only operates when a modal (e.g. RHP) sits on top of the stack.
    const rhpRoute = state.routes.at(-1);
    if (!rhpRoute || isFullScreenName(rhpRoute.name)) {
        return null;
    }

    const routesWithoutRHP = state.routes.slice(0, -1);

    // When the target is a TAB_NAVIGATOR screen, switch tabs within the existing instance
    // rather than pushing a duplicate navigator.
    if (targetRoute.name === NAVIGATORS.TAB_NAVIGATOR) {
        const tabNavIndex = routesWithoutRHP.findLastIndex((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        if (tabNavIndex < 0) {
            return null;
        }
        const existingTabRoute = routesWithoutRHP.at(tabNavIndex);
        const existingTabState = existingTabRoute?.state as NavigationState | undefined;
        if (!existingTabRoute) {
            return null;
        }
        const focusedTargetTab = getFocusedRouteFromNavigatorState(targetRoute.state);
        if (!focusedTargetTab) {
            return null;
        }
        const updatedTabState = getTabStateWithFocusedTarget(existingTabState, focusedTargetTab);
        if (!updatedTabState) {
            return null;
        }
        const staleTabState = existingTabState ? markFocusedTabRouteForRemount(updatedTabState, existingTabState) : updatedTabState;

        const updatedTabRoute = {...existingTabRoute, state: staleTabState} as StackNavigationState<ParamListBase>['routes'][number];
        // Save original route so handleRemoveFullscreenUnderRHP can fully restore it on cancel.
        // In the cold-start fallback the tab navigator has no nested state yet, so saving the raw
        // route would leave it stateless and the dismiss-restore path (removePreInsertedFullscreenIfNeeded)
        // couldn't derive a tab to jump back to, stranding the user on the pre-inserted tab. Synthesize
        // the default Home tab state in that case so the restore lands on the tab the user started on.
        preInsertedOriginalTabRoute = existingTabState?.routes?.length
            ? existingTabRoute
            : ({...existingTabRoute, state: buildTabNavigatorNestedState({name: TAB_SCREENS[0]})} as StackNavigationState<ParamListBase>['routes'][number]);
        const newRoutes = [...routesWithoutRHP.slice(0, tabNavIndex), updatedTabRoute, ...routesWithoutRHP.slice(tabNavIndex + 1), rhpRoute];
        return stackRouter.getRehydratedState({...state, routes: newRoutes, index: newRoutes.length - 1}, configOptions);
    }

    // For non-tab fullscreen targets: push the route underneath the RHP (existing behavior).
    const stateAfterPop = stackRouter.getStateForAction(state, StackActions.pop(), configOptions);
    if (!stateAfterPop) {
        return null;
    }

    let pushParams = targetRoute.params as Record<string, unknown> | undefined;
    const nestedRoute = getFocusedRouteFromNavigatorState(targetRoute.state);
    if (nestedRoute) {
        pushParams = {
            ...pushParams,
            screen: nestedRoute.name,
            params: nestedRoute.params,
        };
    }

    const rehydratedStateAfterPop = stackRouter.getRehydratedState(stateAfterPop, configOptions);
    const stateAfterPush = stackRouter.getStateForAction(rehydratedStateAfterPop, StackActions.push(targetRoute.name, pushParams), configOptions);
    if (!stateAfterPush) {
        return null;
    }

    const rehydratedStateAfterPush = stackRouter.getRehydratedState(stateAfterPush, configOptions);
    return {
        ...rehydratedStateAfterPush,
        routes: [...rehydratedStateAfterPush.routes, rhpRoute],
        index: rehydratedStateAfterPush.routes.length,
    };
}

/**
 * Reverses handleReplaceFullscreenUnderRHP when the user cancels without submitting.
 *
 * For the tab-switch path (target was a TAB_NAVIGATOR screen): restores the original
 * TAB_NAVIGATOR route that was saved during pre-insertion, putting the user back on
 * the tab they were on before with all state intact.
 * State transition: [Tab(B), RHP] -> [Tab(A), RHP]
 *
 * For the push path (target was a non-tab fullscreen): removes the pre-inserted route.
 * State transition: [FS, FS', RHP] -> [FS, RHP]
 */
function handleRemoveFullscreenUnderRHP(
    state: StackNavigationState<ParamListBase>,
    action: RemoveFullscreenUnderRHPActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const rhpRoute = state.routes.at(-1);
    if (rhpRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return null;
    }

    const routesWithoutRHP = state.routes.slice(0, -1);

    // Tab-switch path: restore the original TAB_NAVIGATOR route saved during pre-insertion.
    if (preInsertedOriginalTabRoute) {
        const tabNavIndex = routesWithoutRHP.findLastIndex((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        if (tabNavIndex < 0) {
            preInsertedOriginalTabRoute = undefined;
            return null;
        }
        const originalRoute = preInsertedOriginalTabRoute;
        preInsertedOriginalTabRoute = undefined;
        const newRoutes = [...routesWithoutRHP.slice(0, tabNavIndex), originalRoute, ...routesWithoutRHP.slice(tabNavIndex + 1), rhpRoute];
        return stackRouter.getRehydratedState({...state, routes: newRoutes, index: newRoutes.length - 1}, configOptions);
    }

    // Push path: remove the pre-inserted fullscreen route (existing behavior).
    if (routesWithoutRHP.length < 2) {
        return null;
    }

    const preInsertedRoute = routesWithoutRHP.at(-1);
    if (!preInsertedRoute || !isFullScreenName(preInsertedRoute.name) || preInsertedRoute.name !== action.payload.expectedRouteName) {
        return null;
    }

    const routesWithoutPreInserted = routesWithoutRHP.slice(0, -1);
    const newRoutes = [...routesWithoutPreInserted, rhpRoute];
    return stackRouter.getRehydratedState({...state, routes: newRoutes, index: newRoutes.length - 1}, configOptions);
}

/**
 * Handles the DISMISS_MODAL action.
 * If the last route is a modal route, it has to be popped from the navigation stack.
 */
function handleDismissModalAction(
    state: StackNavigationState<ParamListBase>,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const lastRoute = state.routes.at(-1);
    const newAction = StackActions.pop();

    if (!lastRoute?.name || !MODAL_ROUTES_TO_DISMISS.has(lastRoute?.name)) {
        Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        return null;
    }

    return stackRouter.getStateForAction(state, newAction, configOptions);
}

/**
 * Handles opening a new modal navigator from an existing one.
 */
function handleNavigatingToModalFromModal(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const modifiedState = {...state, routes: state.routes.slice(0, -1), index: state.index !== 0 ? state.index - 1 : 0};
    return stackRouter.getStateForAction(modifiedState, action, configOptions);
}

function handleToggleSidePanelWithHistoryAction(state: StackNavigationState<ParamListBase>, action: ToggleSidePanelWithHistoryActionType) {
    // This shouldn't ever happen as the history should be always defined. It's for type safety.
    if (!state?.history) {
        return state;
    }

    // If it's set to true, we need to add the side panel history entry if it's not already there.
    if (action.payload.isVisible && state.history.at(-1) !== CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL) {
        return {...state, history: [...state.history, CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL]};
    }

    // If it's set to false, we need to remove the side panel history entry if it's there.
    if (!action.payload.isVisible) {
        return {...state, history: state.history.filter((entry) => entry !== CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL)};
    }

    // Else, do not change history.
    return state;
}

/**
 * Push or pop the MFA modal navigator marker on the root history.
 *
 * Idempotent: appends only if the marker is not already on top; removes by filter so
 * multiple removals are safe. useLinking mirrors these history changes to synthetic
 * browser entries that share the underlying screen's URL, giving the overlay a
 * back-button target without exposing it through routing.
 */
function handleToggleMfaModalNavigatorWithHistoryAction(state: StackNavigationState<ParamListBase>, action: ToggleMfaModalNavigatorWithHistoryActionType) {
    if (!state?.history) {
        return state;
    }

    if (action.payload.isVisible && state.history.at(-1) !== CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR) {
        return {...state, history: [...state.history, CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR]};
    }

    if (!action.payload.isVisible) {
        return {...state, history: state.history.filter((entry) => entry !== CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR)};
    }

    return state;
}

function handleToggleModalWithHistoryAction(state: StackNavigationState<ParamListBase>, action: ToggleModalWithHistoryActionType) {
    // This shouldn't ever happen as the history should be always defined. It's for type safety.
    if (!state?.history) {
        return state;
    }

    // Each modal instance owns a uniquely-tagged sentinel so nested modals can be added/removed
    // independently (LIFO), unlike the singleton side-panel sentinel.
    const entry = `${CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MODAL}:${action.payload.modalId}`;

    // On open, append this modal's back-guard sentinel. useLinking sees history grow by one and
    // pushes a browser history entry, so browser Back closes the modal.
    // Skip if already present (e.g. browser Forward restored the saved nav state before our dispatch ran).
    if (action.payload.isVisible) {
        if (state.history.includes(entry)) {
            return state;
        }
        return {...state, history: [...state.history, entry]};
    }

    // On close, remove only this modal's own sentinel (the last matching one). Filtering by exact
    // tag keeps sibling/nested modal sentinels intact.
    const indexToRemove = state.history.lastIndexOf(entry);
    if (indexToRemove === -1) {
        return state;
    }
    return {...state, history: [...state.history.slice(0, indexToRemove), ...state.history.slice(indexToRemove + 1)]};
}

export {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handlePushFullscreenAction,
    handleReplaceFullscreenUnderRHP,
    handleRemoveFullscreenUnderRHP,
    handleReplaceReportsSplitNavigatorAction,
    screensWithEnteringAnimation,
    handleToggleSidePanelWithHistoryAction,
    handleToggleMfaModalNavigatorWithHistoryAction,
    handleToggleModalWithHistoryAction,
    getPreInsertedOriginalTabRoute,
    clearPreInsertedOriginalTabRoute,
    // Exported for unit-test access; not used outside of testing.
    withSanitizedDeepLinkParams,
    getTabStateWithFocusedTarget,
    markFocusedTabRouteForRemount,
};
