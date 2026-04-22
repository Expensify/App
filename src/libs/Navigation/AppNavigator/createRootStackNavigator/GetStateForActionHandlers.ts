import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import SCREENS_WITH_NAVIGATION_TAB_BAR from '@components/Navigation/TopLevelNavigationTabBar/SCREENS_WITH_NAVIGATION_TAB_BAR';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {isFullScreenName, isSplitNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import shouldStripRHPOnFullscreenPush from '@libs/Navigation/helpers/shouldStripRHPOnFullscreenPush';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
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
    const actionToPushWorkspaceNavigator = StackActions.push(NAVIGATORS.WORKSPACE_NAVIGATOR);
    const stateWithWorkspaceNavigator = stackRouter.getStateForAction(state, actionToPushWorkspaceNavigator, configOptions);

    if (!stateWithWorkspaceNavigator) {
        Log.hmmm('[handleOpenWorkspaceOrDomainSplitAction] WorkspaceNavigator has not been found in the navigation state.');
        return null;
    }

    const rehydratedState = stackRouter.getRehydratedState(stateWithWorkspaceNavigator, configOptions);
    const workspaceNavigatorRoute = rehydratedState.routes.at(-1);

    if (workspaceNavigatorRoute?.name !== NAVIGATORS.WORKSPACE_NAVIGATOR) {
        Log.hmmm(`[handleOpenWorkspaceOrDomainSplitAction] ${splitNavigatorName} has not been found in the navigation state.`);
        return null;
    }

    // Directly set the nested state so WorkspacesList is always present underneath the split navigator.
    // React Navigation will rehydrate this partial state (generating route keys) when WorkspaceNavigator mounts.
    const nestedWorkspacesState = {
        routes: [{name: SCREENS.WORKSPACES_LIST}, {name: splitNavigatorName, params: splitNavigatorParams}],
        index: 1,
    };

    return {
        ...rehydratedState,
        routes: [...rehydratedState.routes.slice(0, -1), {...workspaceNavigatorRoute, state: nestedWorkspacesState}],
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

/**
 * Filters preloaded routes when navigating to a central screen of a split navigator on narrow layout.
 * This removes the sidebar screen from the state so only the central screen is shown.
 */
function getStateWithFilteredPreloadedRoutes(state: StackNavigationState<ParamListBase>, navigatorName: string, targetScreen?: string) {
    const shouldFilterPreloadedRoutes =
        getIsNarrowLayout() &&
        isSplitNavigatorName(navigatorName) &&
        targetScreen !== SPLIT_TO_SIDEBAR[navigatorName] &&
        state.preloadedRoutes?.some((preloadedRoute) => preloadedRoute.name === navigatorName);

    return shouldFilterPreloadedRoutes ? {...state, preloadedRoutes: state.preloadedRoutes.filter((preloadedRoute) => preloadedRoute.name !== navigatorName)} : state;
}

function handlePushFullscreenAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const targetScreen = action.payload?.params && 'screen' in action.payload.params ? (action.payload?.params?.screen as string) : undefined;
    const navigatorName = action.payload.name;

    const lastRoute = state.routes.at(-1);

    // On native, strip the RHP before pushing to prevent react-native-screens from freezing it.
    const stateWithoutModal =
        shouldStripRHPOnFullscreenPush && isSideModalNavigator(lastRoute?.name) ? {...state, routes: state.routes.slice(0, -1), index: state.index !== 0 ? state.index - 1 : 0} : state;

    const adjustedState = getStateWithFilteredPreloadedRoutes(stateWithoutModal, navigatorName, targetScreen);
    const stateWithNavigator = stackRouter.getStateForAction(adjustedState, action, configOptions);

    if (!stateWithNavigator) {
        Log.hmmm(`[handlePushAction] ${navigatorName} has not been found in the navigation state.`);
        return null;
    }

    const lastFullScreenRoute = stateWithNavigator.routes.at(-1);

    // Transitioning to all central screens in each split should be animated
    if (lastFullScreenRoute?.key && targetScreen && !SCREENS_WITH_NAVIGATION_TAB_BAR.includes(targetScreen)) {
        screensWithEnteringAnimation.add(lastFullScreenRoute.key);
    }

    return stateWithNavigator;
}

function handleReplaceReportsSplitNavigatorAction(
    state: StackNavigationState<ParamListBase>,
    action: ReplaceActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const targetScreen = action.payload?.params && 'screen' in action.payload.params ? (action.payload?.params?.screen as string) : undefined;
    const navigatorName = action.payload.name;
    const adjustedState = getStateWithFilteredPreloadedRoutes(state, navigatorName, targetScreen);
    const stateWithReportsSplitNavigator = stackRouter.getStateForAction(adjustedState, action, configOptions);

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
 * Inserts a new fullscreen route (e.g. SearchFullscreenNavigator) underneath the
 * currently open modal (RHP) without destroying the original fullscreen route.
 *
 * State transition: [Home, RHP] -> [Home, Search, RHP]
 *
 * This is intentionally different from a REPLACE (which would yield [Search, RHP]
 * and destroy the Home route). Preserving Home is critical for correct browser
 * history: when the RHP is dismissed in the next animation frame, useLinking sees
 * that the Home+RHP browser-history entry is stale and correctly replaces it with
 * a new Search entry, producing browser history [Home, Search].
 *
 * The companion history-preservation logic lives in addRootHistoryRouterExtension
 * which keeps `state.history` unchanged for this action so that no browser history
 * update is triggered during the insert step itself.
 *
 * @see revealRouteBeforeDismissingModal in Navigation.ts - the caller that orchestrates
 *      this action followed by a DISMISS_MODAL on the next animation frame.
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

    // 1. Pop the modal to get the clean fullscreen-only state.
    const stateAfterPop = stackRouter.getStateForAction(state, StackActions.pop(), configOptions);
    if (!stateAfterPop) {
        return null;
    }

    // 2. Push the target fullscreen route on top of the existing one(s).
    //    getStateFromPath returns nested state (e.g. { name: 'SearchFullscreenNavigator', state: { routes: [{ name: 'Search_Central', params: { q: '...' } }] } })
    //    but StackActions.push expects { screen, params } format, so we convert the nested state.
    let pushParams = targetRoute.params as Record<string, unknown> | undefined;
    const nestedRoute = targetRoute.state?.routes?.at(-1);
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

    // 3. Re-add the modal on top so visually nothing changes yet - the user still sees
    //    the RHP, but the new fullscreen route is now rendered behind it.
    const rehydratedStateAfterPush = stackRouter.getRehydratedState(stateAfterPush, configOptions);
    return {
        ...rehydratedStateAfterPush,
        routes: [...rehydratedStateAfterPush.routes, rhpRoute],
        index: rehydratedStateAfterPush.routes.length,
    };
}

/**
 * Reverses handleReplaceFullscreenUnderRHP by removing the fullscreen route that
 * was pre-inserted underneath the currently open modal.
 *
 * State transition: [Home, Search, RHP] -> [Home, RHP]
 *
 * Used when the user backs out of the expense confirmation screen without submitting,
 * so the pre-inserted destination route is cleaned up.
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
    if (routesWithoutRHP.length < 2) {
        return null;
    }

    const preInsertedRoute = routesWithoutRHP.at(-1);
    if (!preInsertedRoute || !isFullScreenName(preInsertedRoute.name) || preInsertedRoute.name !== action.payload.expectedRouteName) {
        return null;
    }

    const routesWithoutPreInserted = routesWithoutRHP.slice(0, -1);
    const newRoutes = [...routesWithoutPreInserted, rhpRoute];
    const rehydratedState = stackRouter.getRehydratedState({...state, routes: newRoutes, index: newRoutes.length - 1}, configOptions);
    return rehydratedState;
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
};
