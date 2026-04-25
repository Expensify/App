import type {CommonActions, NavigationState, PartialState, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import Log from '@libs/Log';
import buildTabNavigatorNestedState from '@libs/Navigation/helpers/buildTabNavigatorNestedState';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {SIDEBAR_TO_SPLIT} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {
    OpenDomainSplitActionType,
    OpenWorkspaceSplitActionType,
    PushActionType,
    RemoveFullscreenUnderRHPActionType,
    ReplaceActionType,
    ReplaceFullscreenUnderRHPActionType,
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
    NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR,
    SCREENS.NOT_FOUND,
    SCREENS.REPORT_ATTACHMENTS,
    SCREENS.REPORT_ADD_ATTACHMENT,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW,
    SCREENS.MONEY_REQUEST.ODOMETER_PREVIEW,
    SCREENS.PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.REPORT_AVATAR,
    SCREENS.CONCIERGE,
    SCREENS.SEARCH_ROUTER.ROOT,
]);

const screensWithEnteringAnimation = new Set<string>();

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

/**
 * Util function with common logic for handling OPEN_WORKSPACE_SPLIT and OPEN_DOMAIN_SPLIT actions.
 *
 * Pushes WorkspaceNavigator onto the root stack and explicitly sets its nested state to
 * [WorkspacesList, SplitNavigator]. This mirrors the structure built by getAdaptedStateFromPath
 * and guarantees WorkspacesList is in the back stack so the user can swipe back to it on iOS.
 *
 * Note: passing {screen, params} as route params is not sufficient because React Navigation only
 * processes the screen param after mounting (via useEffect), so the nested state would not be
 * set up at state-computation time.
 */
function prepareStateUnderWorkspaceOrDomainNavigator(
    state: StackNavigationState<ParamListBase>,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    splitNavigatorName: typeof NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR | typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
    splitNavigatorParams: Record<string, unknown>,
) {
    const actionToPushRootTab = StackActions.push(NAVIGATORS.TAB_NAVIGATOR, {screen: NAVIGATORS.WORKSPACE_NAVIGATOR});
    const stateWithRootTab = stackRouter.getStateForAction(state, actionToPushRootTab, configOptions);

    if (!stateWithRootTab) {
        Log.hmmm('[handleOpenWorkspaceOrDomainSplitAction] TabNavigator has not been found in the navigation state.');
        return null;
    }

    const rehydratedState = stackRouter.getRehydratedState(stateWithRootTab, configOptions);
    const rootTabRoute = rehydratedState.routes.at(-1);

    if (!rootTabRoute || rootTabRoute.name !== NAVIGATORS.TAB_NAVIGATOR) {
        Log.hmmm(`[handleOpenWorkspaceOrDomainSplitAction] ${splitNavigatorName} has not been found in the navigation state.`);
        return null;
    }

    // Find the WORKSPACE_NAVIGATOR within the tab state and set its nested state
    // so WorkspacesList is always present underneath the split navigator.
    const tabState = rootTabRoute.state;
    const workspaceNavIndex = tabState?.routes?.findIndex((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR) ?? -1;

    if (workspaceNavIndex < 0 || !tabState) {
        Log.hmmm('[handleOpenWorkspaceOrDomainSplitAction] WorkspaceNavigator not found in tab state.');
        return null;
    }

    const workspaceNavRoute = tabState.routes[workspaceNavIndex];
    const nestedWorkspacesState = {
        routes: [{name: SCREENS.WORKSPACES_LIST}, {name: splitNavigatorName, params: splitNavigatorParams}],
        index: 1,
    };

    const updatedTabRoutes = [...tabState.routes];
    updatedTabRoutes[workspaceNavIndex] = {...workspaceNavRoute, state: nestedWorkspacesState};

    const updatedTabState = {...tabState, routes: updatedTabRoutes, index: workspaceNavIndex};
    const updatedRootTabRoute = {...rootTabRoute, state: updatedTabState};

    return {
        ...rehydratedState,
        routes: [...rehydratedState.routes.slice(0, -1), updatedRootTabRoute],
    };
}

/**
 * Handles the OPEN_WORKSPACE_SPLIT action.
 * If the user is on other tab than workspaces and the workspace split is "remembered", this action will be called after pressing the settings tab.
 */
function handleOpenWorkspaceSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: OpenWorkspaceSplitActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    return prepareStateUnderWorkspaceOrDomainNavigator(state, configOptions, stackRouter, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {policyID: action.payload.policyID},
    });
}

/**
 * Handles the OPEN_DOMAIN_SPLIT action.
 * If the user is on other tab than workspaces and the domain split is "remembered", this action will be called after pressing the settings tab.
 */
function handleOpenDomainSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: OpenDomainSplitActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    return prepareStateUnderWorkspaceOrDomainNavigator(state, configOptions, stackRouter, NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {domainAccountID: action.payload.domainAccountID},
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
        if (!existingTabRoute || !existingTabState?.routes?.length) {
            return null;
        }
        const focusedTargetTab = getFocusedRouteFromNavigatorState(targetRoute.state);
        if (!focusedTargetTab) {
            return null;
        }
        const targetTabIndex = existingTabState.routes.findIndex((r) => r.name === focusedTargetTab.name);
        if (targetTabIndex < 0) {
            return null;
        }
        // Only update the target tab's nested state; all other tabs are left intact.
        const updatedTabRoutes = existingTabState.routes.map((r, i) => {
            if (i !== targetTabIndex) {
                return r;
            }
            // Prepend the existing sidebar/root route (e.g. Inbox) to the incoming state when
            // it starts with a different screen, so back navigation from the new screen
            // lands on the sidebar.
            let mergedNestedState = focusedTargetTab.state;
            const existingNestedRoutes = (r.state as PartialState<NavigationState> | undefined)?.routes;
            const newNestedRoutes = focusedTargetTab.state?.routes;
            const existingFirstRoute = existingNestedRoutes?.at(0);
            const newFirstRoute = newNestedRoutes?.at(0);
            if (existingFirstRoute && newFirstRoute && existingFirstRoute.name !== newFirstRoute.name) {
                const prependedRoutes = [existingFirstRoute, ...(newNestedRoutes ?? [])];
                mergedNestedState = {...focusedTargetTab.state, routes: prependedRoutes, index: prependedRoutes.length - 1};
            }
            return {
                ...r,
                ...(focusedTargetTab.params !== undefined ? {params: focusedTargetTab.params} : {}),
                ...(mergedNestedState !== undefined ? {state: mergedNestedState as typeof r.state} : {}),
            };
        });
        const updatedTabState = {...existingTabState, routes: updatedTabRoutes, index: targetTabIndex};
        const updatedTabRoute = {...existingTabRoute, state: updatedTabState} as StackNavigationState<ParamListBase>['routes'][number];
        // Save original route so handleRemoveFullscreenUnderRHP can fully restore it on cancel.
        preInsertedOriginalTabRoute = existingTabRoute;
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

export {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handleOpenWorkspaceSplitAction,
    handleOpenDomainSplitAction,
    handlePushFullscreenAction,
    handleReplaceFullscreenUnderRHP,
    handleRemoveFullscreenUnderRHP,
    handleReplaceReportsSplitNavigatorAction,
    screensWithEnteringAnimation,
    handleToggleSidePanelWithHistoryAction,
    getPreInsertedOriginalTabRoute,
    clearPreInsertedOriginalTabRoute,
};
